"use client";

import React, { useEffect } from "react";
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
} from "@/lib/features/activation-cards/activationCardsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import styles from "./ActivationCardsPage.module.css";

// 激活卡测试页面
export default function ActivationCardsPage() {
  const dispatch = useAppDispatch();
  
  // 从Redux store获取状态
  const cards = useAppSelector(selectAllCards);
  const status = useAppSelector(selectCardsStatus);
  const error = useAppSelector(selectCardsError);
  const createStatus = useAppSelector(selectCreateStatus);
  const createError = useAppSelector(selectCreateError);
  const unusedCards = useAppSelector(selectUnusedCards);
  const usedCards = useAppSelector(selectUsedCards);
  const expiredCards = useAppSelector(selectExpiredCards);

  // 组件挂载时获取激活卡列表
  useEffect(() => {
    dispatch(fetchActivationCards());
  }, [dispatch]);

  // 创建新激活卡
  const handleCreateCard = async (cardType: "test" | "day" | "week" | "month") => {
    const newCardData = {
      card_type: cardType,
      note: `${cardType}类型测试卡`,
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
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>
            激活卡管理系统
          </h1>
          
          {/* 操作按钮区域 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>创建激活卡</h2>
            <div className={styles.buttonGrid}>
              <button
                onClick={() => handleCreateCard("test")}
                disabled={createStatus === "loading"}
                className={styles.buttonTest}
              >
                {createStatus === "loading" ? "创建中..." : "创建测试卡"}
              </button>
              
              <button
                onClick={() => handleCreateCard("day")}
                disabled={createStatus === "loading"}
                className={styles.buttonDay}
              >
                {createStatus === "loading" ? "创建中..." : "创建日卡"}
              </button>
              
              <button
                onClick={() => handleCreateCard("week")}
                disabled={createStatus === "loading"}
                className={styles.buttonWeek}
              >
                {createStatus === "loading" ? "创建中..." : "创建周卡"}
              </button>
              
              <button
                onClick={() => handleCreateCard("month")}
                disabled={createStatus === "loading"}
                className={styles.buttonMonth}
              >
                {createStatus === "loading" ? "创建中..." : "创建月卡"}
              </button>
            </div>
            
            <button
              onClick={handleClearErrors}
              className={styles.buttonSecondary}
            >
              清除错误信息
            </button>
          </div>

          {/* 错误信息显示 */}
          {(error || createError) && (
            <div className={styles.errorMessage}>
              <p><strong>错误:</strong> {error || createError}</p>
            </div>
          )}

          {/* 统计信息卡片 */}
          <div className={styles.statsGrid}>
            <div className={styles.statCardUnused}>
              <div className={styles.statContent}>
                <h3>未使用</h3>
                <p>{unusedCards.length}</p>
              </div>
              <div className={styles.statIcon}>📋</div>
            </div>
            
            <div className={styles.statCardUsed}>
              <div className={styles.statContent}>
                <h3>已使用</h3>
                <p>{usedCards.length}</p>
              </div>
              <div className={styles.statIcon}>✅</div>
            </div>
            
            <div className={styles.statCardExpired}>
              <div className={styles.statContent}>
                <h3>已过期</h3>
                <p>{expiredCards.length}</p>
              </div>
              <div className={styles.statIcon}>⏰</div>
            </div>
          </div>

          {/* 激活卡列表 */}
          <div>
            <div className={styles.listHeader}>
              <h2 className={styles.listTitle}>激活卡列表</h2>
              <div className={styles.listCount}>
                总计: {cards.length} 张卡片
              </div>
            </div>
            
            {status === "loading" ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <span className={styles.loadingText}>加载中...</span>
              </div>
            ) : cards.length === 0 ? (
              <div className={styles.emptyContainer}>
                <div className={styles.emptyIcon}>📝</div>
                <p className={styles.emptyTitle}>暂无激活卡</p>
                <p className={styles.emptySubtitle}>点击上方按钮创建第一张激活卡</p>
              </div>
            ) : (
              <div className={styles.cardsGrid}>
                {cards.map((card) => (
                  <div key={card.id} className={styles.cardItem}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitle}>
                        激活码: <span className={styles.codeDisplay}>{card.code}</span>
                      </div>
                    </div>
                    
                    <div className={styles.cardInfo}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>类型:</span>
                        <span className={`${styles.badge} ${
                          card.card_type === "test" ? styles.badgeTest :
                          card.card_type === "day" ? styles.badgeDay :
                          card.card_type === "week" ? styles.badgeWeek :
                          styles.badgeMonth
                        }`}>
                          {card.card_type}
                        </span>
                      </div>
                      
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>状态:</span>
                        <span className={`${styles.badge} ${
                          card.activation_status === "unused" ? styles.badgeUnused :
                          card.activation_status === "used" ? styles.badgeUsed :
                          styles.badgeExpired
                        }`}>
                          {card.activation_status}
                        </span>
                      </div>
                      
                      {card.note && (
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>备注:</span>
                          <span className={styles.infoValue}>{card.note}</span>
                        </div>
                      )}
                      
                      {card.expires_at && (
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>过期时间:</span>
                          <span className={styles.infoValue}>
                            {new Date(card.expires_at).toLocaleString('zh-CN')}
                          </span>
                        </div>
                      )}
                      
                      {card.activated_at && (
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>激活时间:</span>
                          <span className={styles.infoValue}>
                            {new Date(card.activated_at).toLocaleString('zh-CN')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
