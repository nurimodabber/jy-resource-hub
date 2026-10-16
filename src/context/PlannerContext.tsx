import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SessionPlan, SessionSlot, SessionReview, Language } from '../types';

interface PlannerContextType {
  plans: SessionPlan[];
  activePlan: SessionPlan | null;
  activePlanId: string | null;
  setActivePlanId: (id: string) => void;
  createNewPlan: (name?: string, slots?: SessionSlot[], targetDuration?: number, startTime?: string) => SessionPlan;
  deletePlan: (id: string) => void;
  renamePlan: (id: string, name: string) => void;
  updatePlanMeta: (id: string, meta: { name?: string; startTime?: string; targetDurationMinutes?: number; date?: string; review?: SessionReview }) => void;
  duplicatePlan: (id: string) => SessionPlan;
  addSlotToPlan: (slotData: Omit<SessionSlot, 'id'>, planId?: string) => { slotId: string; planId: string; undo: () => void };
  updateSlot: (slotId: string, updates: Partial<SessionSlot>) => void;
  removeSlot: (slotId: string) => { restoredSlot: SessionSlot; undo: () => void };
  reorderSlots: (startIndex: number, endIndex: number) => void;
  duplicateSlot: (slotId: string) => void;
  clearActivePlan: () => { previousSlots: SessionSlot[]; undo: () => void };
  loadPresetIntoPlan: (slots: SessionSlot[], presetName: string, targetDuration?: number) => void;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

const STORAGE_PLANS_KEY = 'jy_plans';
const STORAGE_ACTIVE_PLAN_KEY = 'jy_active_plan_id';
const LEGACY_STORAGE_KEY = 'jy_modular_session_plan';
const MIGRATION_BACKUP_KEY = 'jy_migration_backup';

export const PlannerProvider: React.FC<{ children: React.ReactNode; language: Language }> = ({ children, language }) => {
  const [plans, setPlans] = useState<SessionPlan[]>(() => {
    try {
      // 1. One-time migration of legacy jy_modular_session_plan into jy_plans
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        localStorage.setItem(MIGRATION_BACKUP_KEY, legacyRaw);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        try {
          const legacySlots = JSON.parse(legacyRaw);
          if (Array.isArray(legacySlots) && legacySlots.length > 0) {
            const migratedPlan: SessionPlan = {
              id: 'plan-migrated-' + Date.now(),
              name: language === 'de' ? 'Importiertes Treffen' : 'Imported Gathering',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              slots: legacySlots,
              startTime: '17:00',
              targetDurationMinutes: 75,
            };
            const saved = localStorage.getItem(STORAGE_PLANS_KEY);
            const existingPlans = saved ? JSON.parse(saved) : [];
            const combined = [migratedPlan, ...(Array.isArray(existingPlans) ? existingPlans : [])];
            localStorage.setItem(STORAGE_PLANS_KEY, JSON.stringify(combined));
            return combined;
          }
        } catch {
          // ignore parsing error
        }
      }

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

  const createNewPlan = useCallback((name?: string, initialSlots: SessionSlot[] = [], targetDuration = 75, startTime = '17:00'): SessionPlan => {
    const id = 'plan-' + Date.now();
    const defaultName = name || (language === 'de' ? `Treffen ${plans.length + 1}` : `Gathering ${plans.length + 1}`);
    const newPlan: SessionPlan = {
      id,
      name: defaultName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      slots: initialSlots,
      targetDurationMinutes: targetDuration,
      startTime,
    };

    setPlans((prev) => [newPlan, ...prev]);
    setActivePlanIdState(id);
    return newPlan;
  }, [language, plans.length]);

  const updatePlanMeta = useCallback((id: string, meta: { name?: string; startTime?: string; targetDurationMinutes?: number; date?: string; review?: SessionReview }) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...meta, updatedAt: Date.now() } : p))
    );
  }, []);

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

  const duplicateSlot = useCallback((slotId: string) => {
    setPlans((prev) =>
      prev.map((plan) => {
        const idx = plan.slots.findIndex((s) => s.id === slotId);
        if (idx !== -1) {
          const original = plan.slots[idx];
          const copy: SessionSlot = {
            ...JSON.parse(JSON.stringify(original)),
            id: 'slot-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            title: {
              de: `${original.title.de} (Kopie)`,
              en: `${original.title.en} (Copy)`,
            },
          };
          const updatedSlots = [...plan.slots];
          updatedSlots.splice(idx + 1, 0, copy);
          return {
            ...plan,
            updatedAt: Date.now(),
            slots: updatedSlots,
          };
        }
        return plan;
      })
    );
  }, []);

  const loadPresetIntoPlan = useCallback((slots: SessionSlot[], presetName: string, targetDuration = 75, startTime = '17:00') => {
    const preparedSlots: SessionSlot[] = slots.map((s, idx) => ({
      ...s,
      id: s.id || `slot-preset-${Date.now()}-${idx}`,
    }));

    setPlans((prev) => {
      const active = prev.find((p) => p.id === activePlanId);
      if (active && active.slots.length === 0) {
        return prev.map((p) =>
          p.id === activePlanId
            ? {
                ...p,
                name: presetName,
                slots: preparedSlots,
                targetDurationMinutes: targetDuration,
                startTime: startTime || p.startTime || '17:00',
                updatedAt: Date.now(),
              }
            : p
        );
      }
      const id = 'plan-' + Date.now();
      const newPlan: SessionPlan = {
        id,
        name: presetName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        slots: preparedSlots,
        targetDurationMinutes: targetDuration,
        startTime: startTime || '17:00',
      };
      setActivePlanIdState(id);
      return [newPlan, ...prev];
    });
  }, [activePlanId]);

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
        updatePlanMeta,
        duplicatePlan,
        addSlotToPlan,
        updateSlot,
        removeSlot,
        reorderSlots,
        duplicateSlot,
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
