import { createAppSlice } from "@/lib/createAppSlice";
import type { AppThunk } from "@/lib/store";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { 
  getActivationCards, 
  createActivationCard, 
  getActivationCardById,
  type ActivationCard,
  type CreateActivationCardData 
} from "./activationCardsAPI";

// 激活卡状态接口
export interface ActivationCardsSliceState {
  cards: ActivationCard[];
  currentCard: ActivationCard | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  createStatus: "idle" | "loading" | "succeeded" | "failed";
  createError: string | null;
}

// 初始状态
const initialState: ActivationCardsSliceState = {
  cards: [],
  currentCard: null,
  status: "idle",
  error: null,
  createStatus: "idle",
  createError: null,
};

// 激活卡Slice
export const activationCardsSlice = createAppSlice({
  name: "activationCards",
  initialState,
  reducers: (create) => ({
    // 清除错误信息
    clearErrors: create.reducer((state) => {
      state.error = null;
      state.createError = null;
    }),
    
    // 清除当前卡片
    clearCurrentCard: create.reducer((state) => {
      state.currentCard = null;
    }),
    
    // 手动添加卡片到列表（用于创建成功后）
    addCardToList: create.reducer((state, action: PayloadAction<ActivationCard>) => {
      state.cards.unshift(action.payload);
    }),
    
    // 更新卡片状态
    updateCardStatus: create.reducer((state, action: PayloadAction<{ id: number; status: string }>) => {
      const card = state.cards.find(card => card.id === action.payload.id);
      if (card) {
        card.activation_status = action.payload.status as any;
      }
      if (state.currentCard?.id === action.payload.id) {
        state.currentCard.activation_status = action.payload.status as any;
      }
    }),
  }),
  
  // 异步thunks
  extraReducers: (builder) => {
    // 获取激活卡列表
    builder
      .addCase(fetchActivationCards.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchActivationCards.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cards = action.payload;
        state.error = null;
      })
      .addCase(fetchActivationCards.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "获取激活卡列表失败";
      })
      
      // 创建激活卡
      .addCase(createNewActivationCard.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createNewActivationCard.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.cards.unshift(action.payload);
        state.createError = null;
      })
      .addCase(createNewActivationCard.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.error.message || "创建激活卡失败";
      })
      
      // 根据ID获取激活卡
      .addCase(fetchActivationCardById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchActivationCardById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentCard = action.payload;
        state.error = null;
      })
      .addCase(fetchActivationCardById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "获取激活卡详情失败";
      });
  },
  
  // 选择器
  selectors: {
    selectAllCards: (state) => state.cards,
    selectCurrentCard: (state) => state.currentCard,
    selectCardsStatus: (state) => state.status,
    selectCardsError: (state) => state.error,
    selectCreateStatus: (state) => state.createStatus,
    selectCreateError: (state) => state.createError,
    
    // 根据状态筛选卡片
    selectCardsByStatus: (state) => (status: string) => 
      state.cards.filter(card => card.activation_status === status),
    
    // 根据类型筛选卡片
    selectCardsByType: (state) => (type: string) => 
      state.cards.filter(card => card.card_type === type),
    
    // 获取未使用的卡片
    selectUnusedCards: (state) => 
      state.cards.filter(card => card.activation_status === "unused"),
    
    // 获取已使用的卡片
    selectUsedCards: (state) => 
      state.cards.filter(card => card.activation_status === "used"),
    
    // 获取过期的卡片
    selectExpiredCards: (state) => 
      state.cards.filter(card => card.activation_status === "expired"),
  },
});

// 异步thunk：获取激活卡列表
export const fetchActivationCards = createAsyncThunk(
  "activationCards/fetchActivationCards",
  async () => {
    const response = await getActivationCards();
    return response.data;
  }
);

// 异步thunk：创建激活卡
export const createNewActivationCard = createAsyncThunk(
  "activationCards/createNewActivationCard",
  async (data: CreateActivationCardData) => {
    const response = await createActivationCard(data);
    return response.data;
  }
);

// 异步thunk：根据ID获取激活卡
export const fetchActivationCardById = createAsyncThunk(
  "activationCards/fetchActivationCardById",
  async (id: string | number) => {
    const response = await getActivationCardById(id);
    return response.data;
  }
);

// 导出的actions
export const { 
  clearErrors, 
  clearCurrentCard, 
  addCardToList, 
  updateCardStatus 
} = activationCardsSlice.actions;

// 导出的selectors
export const {
  selectAllCards,
  selectCurrentCard,
  selectCardsStatus,
  selectCardsError,
  selectCreateStatus,
  selectCreateError,
  selectCardsByStatus,
  selectCardsByType,
  selectUnusedCards,
  selectUsedCards,
  selectExpiredCards,
} = activationCardsSlice.selectors;

// 手动thunk：批量创建激活卡
export const createMultipleActivationCards = 
  (cardsData: CreateActivationCardData[]): AppThunk =>
  async (dispatch) => {
    try {
      const promises = cardsData.map(data => 
        dispatch(createNewActivationCard(data)).unwrap()
      );
      await Promise.all(promises);
    } catch (error) {
      console.error("批量创建激活卡失败:", error);
    }
  };
