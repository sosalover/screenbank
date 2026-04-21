import React, { createContext, useContext, useReducer, ReactNode } from "react";

export type ShopItem = {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  impact: string;
  sceneEmoji: string;
};

export type PurchasedItem = ShopItem & {
  purchasedAt: Date;
  position: { x: number; y: number };
};

type State = {
  tokenBalance: number;
  purchasedItems: PurchasedItem[];
};

type Action = { type: "BUY_ITEM"; item: ShopItem };

export const SHOP_ITEMS: ShopItem[] = [
  { id: "tree", name: "Plant a Tree", emoji: "🌳", cost: 30, impact: "Plants a real tree via One Tree Planted", sceneEmoji: "🌳" },
  { id: "puppy", name: "Sponsor a Puppy", emoji: "🐾", cost: 50, impact: "Funds 1 week of shelter care", sceneEmoji: "🐕" },
  { id: "ocean", name: "Clean Ocean Plastic", emoji: "🌊", cost: 40, impact: "Removes 1kg of ocean plastic", sceneEmoji: "🐬" },
  { id: "bee", name: "Save the Bees", emoji: "🐝", cost: 25, impact: "Plants 1m² of pollinator habitat", sceneEmoji: "🌸" },
];

export const MOCK_SCREEN_TIME = {
  todayUsed: "2h 14m",
  budget: "3h 0m",
  remaining: "46m",
  potentialTokens: 46,
  avgScreenTime: "3h 42m",
};

const initialState: State = {
  tokenBalance: 150,
  purchasedItems: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "BUY_ITEM": {
      if (state.tokenBalance < action.item.cost) return state;
      const purchased: PurchasedItem = {
        ...action.item,
        purchasedAt: new Date(),
        position: {
          x: Math.random() * 0.7 + 0.05,
          y: Math.random() * 0.3 + 0.45,
        },
      };
      return {
        tokenBalance: state.tokenBalance - action.item.cost,
        purchasedItems: [...state.purchasedItems, purchased],
      };
    }
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
