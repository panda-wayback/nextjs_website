import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/storage/store';
import {
  fetchActivationCards,
  createNewActivationCard,
  selectAllCards,
  selectCardsStatus,
  selectCardsError,
  selectCreateStatus,
  selectCreateError,
  selectUnusedCards,
  selectUsedCards,
  selectExpiredCards,
  clearErrors,
} from './activationCardsSlice';

// 激活卡示例组件
export const ActivationCardsExample: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // 从Redux store获取状态
  const cards = useSelector(selectAllCards);
  const status = useSelector(selectCardsStatus);
  const error = useSelector(selectCardsError);
  const createStatus = useSelector(selectCreateStatus);
  const createError = useSelector(selectCreateError);
  const unusedCards = useSelector(selectUnusedCards);
  const usedCards = useSelector(selectUsedCards);
  const expiredCards = useSelector(selectExpiredCards);

  // 组件挂载时获取激活卡列表
  useEffect(() => {
    dispatch(fetchActivationCards());
  }, [dispatch]);

  // 创建新激活卡
  const handleCreateCard = async () => {
    const newCardData = {
      card_type: "day" as const,
      note: "测试激活卡",
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后过期
    };
    
    try {
      await dispatch(createNewActivationCard(newCardData)).unwrap();
      console.log("激活卡创建成功！");
    } catch (error) {
      console.error("创建激活卡失败:", error);
    }
  };

  // 清除错误信息
  const handleClearErrors = () => {
    dispatch(clearErrors());
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">激活卡管理</h1>
      
      {/* 操作按钮 */}
      <div className="mb-6 space-x-4">
        <button
          onClick={handleCreateCard}
          disabled={createStatus === "loading"}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
        >
          {createStatus === "loading" ? "创建中..." : "创建新激活卡"}
        </button>
        
        <button
          onClick={handleClearErrors}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          清除错误
        </button>
      </div>

      {/* 错误信息显示 */}
      {(error || createError) && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p><strong>错误:</strong> {error || createError}</p>
        </div>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded">
          <h3 className="font-semibold text-green-800">未使用</h3>
          <p className="text-2xl font-bold text-green-600">{unusedCards.length}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="font-semibold text-blue-800">已使用</h3>
          <p className="text-2xl font-bold text-blue-600">{usedCards.length}</p>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <h3 className="font-semibold text-red-800">已过期</h3>
          <p className="text-2xl font-bold text-red-600">{expiredCards.length}</p>
        </div>
      </div>

      {/* 激活卡列表 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">激活卡列表</h2>
        
        {status === "loading" ? (
          <p>加载中...</p>
        ) : cards.length === 0 ? (
          <p>暂无激活卡</p>
        ) : (
          <div className="grid gap-4">
            {cards.map((card) => (
              <div key={card.id} className="border rounded-lg p-4 bg-white shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">激活码: {card.code}</h3>
                    <p className="text-sm text-gray-600">
                      类型: {card.card_type} | 状态: {card.activation_status}
                    </p>
                    {card.note && (
                      <p className="text-sm text-gray-500 mt-1">备注: {card.note}</p>
                    )}
                    {card.expires_at && (
                      <p className="text-sm text-gray-500">
                        过期时间: {new Date(card.expires_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${
                      card.activation_status === "unused" 
                        ? "bg-green-100 text-green-800"
                        : card.activation_status === "used"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {card.activation_status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
