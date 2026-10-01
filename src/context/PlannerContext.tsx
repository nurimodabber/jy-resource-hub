import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SessionPlan, SessionSlot, Language } from '../types';

interface PlannerContextType {
  plans: SessionPlan[];
  activePlan: SessionPlan | null;
  activePlanId: string | null;
  setActivePlanId: (id: string) => void;
  createNewPlan: (name?: string, slots?: SessionSlot[]) => SessionPlan;
  deletePlan: (id: string) => void;
  renamePlan: (id: string, name: string) => void;
  duplicatePlan: (id: string) => SessionPlan;
  addSlotToPlan: (slotData: Omit<SessionSlot, 'id'>, planId?: string) => { slotId: string; planId: string; undo: () => void };
  updateSlot: (slotId: string, updates: Partial<SessionSlot>) => void;
  removeSlot: (slotId: string) => { restoredSlot: SessionSlot; undo: () => void };
  reorderSlots: (startIndex: number, endIndex: number) => void;
  clearActivePlan: () => { previousSlots: SessionSlot[]; undo: () => void };
  loadPresetIntoPlan: (slots: SessionSlot[], presetName: string) => void;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

const STORAGE_PLANS_KEY = 'jy_plans';
const STORAGE_ACTIVE_PLAN_KEY = 'jy_active_plan_id';

export const PlannerProvider: React.FC<{ children: React.ReactNode; language: Language }> = ({ children, language }) => {
  const [plans, setPlans] = useState<SessionPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PLANS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // LocalStorage error
    }
    return [];
  });

  const [activePlanId, setActivePlanIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_ACTIVE_PLAN_KEY) || null;
    } catch {
      return null;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PLANS_KEY, JSON.stringify(plans));
    } catch {
      // ignore
    }
  }, [plans]);

  useEffect(() => {
    try {
      if (activePlanId) {
        localStorage.setItem(STORAGE_ACTIVE_PLAN_KEY, activePlanId);
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_PLAN_KEY);
      }
    } catch {
      // ignore
    }
  }, [activePlanId]);

  const activePlan = plans.find((p) => p.id === activePlanId) || (plans.length > 0 ? plans[0] : null);

  const setActivePlanId = useCallback((id: string) => {
    setActivePlanIdState(id);
  }, []);

  const createNewPlan = useCallback((name?: string, initialSlots: SessionSlot[] = []): SessionPlan => {
    const id = 'plan-' + Date.now();
    const defaultName = name || (language === 'de' ? `Ablauf ${plans.length + 1}` : `Session Plan ${plans.length + 1}`);
    const newPlan: SessionPlan = {
      id,
      name: defaultName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      slots: initialSlots,
    };

    setPlans((prev) => [newPlan, ...prev]);
    setActivePlanIdState(id);
    return newPlan;
  }, [language, plans.length]);

  const deletePlan = useCallback((id: string) => {
    setPlans((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (activePlanId === id) {
        setActivePlanIdState(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  }, [activePlanId]);

  const renamePlan = useCallback((id: string, name: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name, updatedAt: Date.now() } : p))
    );
  }, []);

  const duplicatePlan = useCallback((id: string): SessionPlan => {
    const target = plans.find((p) => p.id === id);
    const copyId = 'plan-' + Date.now();
    const copyName = target ? `${target.name} (${language === 'de' ? 'Kopie' : 'Copy'})` : 'Plan Copy';
    const newPlan: SessionPlan = {
      id: copyId,
      name: copyName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      slots: target ? JSON.parse(JSON.stringify(target.slots)) : [],
    };
    setPlans((prev) => [newPlan, ...prev]);
    setActivePlanIdState(copyId);
    return newPlan;
  }, [language, plans]);

  const addSlotToPlan = useCallback(
    (slotData: Omit<SessionSlot, 'id'>, targetPlanId?: string) => {
      const slotId = 'slot-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      const newSlot: SessionSlot = { ...slotData, id: slotId };

      let effectivePlanId = targetPlanId || activePlanId;

      setPlans((prev) => {
        const planExists = prev.some((p) => p.id === effectivePlanId);
        if (!planExists || !effectivePlanId) {
          effectivePlanId = 'plan-' + Date.now();
          const freshPlan: SessionPlan = {
            id: effectivePlanId,
            name: language === 'de' ? 'Mein Ablauf' : 'My Session Plan',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            slots: [newSlot],
          };
          setActivePlanIdState(effectivePlanId);
          return [freshPlan, ...prev];
        }

        return prev.map((plan) => {
          if (plan.id === effectivePlanId) {
            return {
              ...plan,
              updatedAt: Date.now(),
              slots: [...plan.slots, newSlot],
            };
          }
          return plan;
        });
      });

      const undo = () => {
        setPlans((prev) =>
          prev.map((plan) => {
            if (plan.id === effectivePlanId) {
              return {
                ...plan,
                slots: plan.slots.filter((s) => s.id !== slotId),
              };
            }
            return plan;
          })
        );
      };

      return { slotId, planId: effectivePlanId || '', undo };
    },
    [activePlanId, language]
  );

  const updateSlot = useCallback((slotId: string, updates: Partial<SessionSlot>) => {
    setPlans((prev) =>
      prev.map((plan) => ({
        ...plan,
        updatedAt: Date.now(),
        slots: plan.slots.map((s) => (s.id === slotId ? { ...s, ...updates } : s)),
      }))
    );
  }, []);

  const removeSlot = useCallback(
    (slotId: string) => {
      let removedSlot: SessionSlot | null = null;
      let targetPlanId: string | null = null;

      setPlans((prev) =>
        prev.map((plan) => {
          const found = plan.slots.find((s) => s.id === slotId);
          if (found) {
            removedSlot = found;
            targetPlanId = plan.id;
            return {
              ...plan,
              updatedAt: Date.now(),
              slots: plan.slots.filter((s) => s.id !== slotId),
            };
          }
          return plan;
        })
      );

      const undo = () => {
        if (removedSlot && targetPlanId) {
          const toRestore = removedSlot;
          setPlans((prev) =>
            prev.map((plan) => {
              if (plan.id === targetPlanId) {
                return {
                  ...plan,
                  slots: [...plan.slots, toRestore],
                };
              }
              return plan;
            })
          );
        }
      };

      return {
        restoredSlot: removedSlot || ({} as SessionSlot),
        undo,
      };
    },
    []
  );

  const reorderSlots = useCallback((startIndex: number, endIndex: number) => {
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === activePlan?.id) {
          const result = Array.from(plan.slots);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return {
            ...plan,
            updatedAt: Date.now(),
            slots: result,
          };
        }
        return plan;
      })
    );
  }, [activePlan?.id]);

  const clearActivePlan = useCallback(() => {
    let previousSlots: SessionSlot[] = [];
    const currentPlanId = activePlan?.id;

    if (activePlan) {
      previousSlots = [...activePlan.slots];
    }

    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === currentPlanId) {
          return {
            ...plan,
            updatedAt: Date.now(),
            slots: [],
          };
        }
        return plan;
      })
    );

    const undo = () => {
      setPlans((prev) =>
        prev.map((plan) => {
          if (plan.id === currentPlanId) {
            return {
              ...plan,
              slots: previousSlots,
            };
          }
          return plan;
        })
      );
    };

    return { previousSlots, undo };
  }, [activePlan]);

  const loadPresetIntoPlan = useCallback((slots: SessionSlot[], presetName: string) => {
    const id = 'plan-' + Date.now();
    const newPlan: SessionPlan = {
      id,
      name: presetName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      slots: JSON.parse(JSON.stringify(slots)),
    };
    setPlans((prev) => [newPlan, ...prev]);
    setActivePlanIdState(id);
  }, []);

  return (
    <PlannerContext.Provider
      value={{
        plans,
        activePlan,
        activePlanId,
        setActivePlanId,
        createNewPlan,
        deletePlan,
        renamePlan,
        duplicatePlan,
        addSlotToPlan,
        updateSlot,
        removeSlot,
        reorderSlots,
        clearActivePlan,
        loadPresetIntoPlan,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = (): PlannerContextType => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};
