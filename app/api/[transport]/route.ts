// app/api/[transport]/route.ts
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { getStrapiClient } from "@/lib/utils/strapiConfig";
import type {
  ActivationCardStatus,
  ActivationCardType,
  ActivationCard,
} from "@/app/api/strapi/activation-cards/types";

// CORS 辅助函数：为响应添加 CORS headers
function addCorsHeaders(response: Response, request: Request): Response {
  const origin = request.headers.get("origin");
  const headers = new Headers(response.headers);
  
  // 如果请求来自特定 origin，使用它；否则允许所有来源（但不使用 credentials）
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
  } else {
    headers.set("Access-Control-Allow-Origin", "*");
  }
  
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization");
  
  // 如果是 preflight 请求，也设置 Max-Age
  if (request.method === "OPTIONS") {
    headers.set("Access-Control-Max-Age", "86400");
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const handler = createMcpHandler(
  (server) => {
    // 获取激活卡列表
    server.tool(
      "get_activation_cards",
      "获取激活卡列表，支持筛选和分页",
      {
        status: z.enum(["unassigned", "assigned", "used", "expired"]).optional(),
        type: z.enum(["test", "day", "week", "month", "year", "permanent"]).optional(),
        populate: z.string().optional(),
        sort: z.string().optional(),
      },
      async ({ status, type, populate, sort }) => {
        try {
          const strapiClient = await getStrapiClient();
          const cards = strapiClient.collection("activation-cards");

          const queryParamsObj: any = {
            populate: populate === "*" ? "*" : populate?.split(",") || "*",
            sort: sort ? [sort] : ["createdAt:desc"],
          };

          if (status) {
            queryParamsObj.filters = {
              ...queryParamsObj.filters,
              activation_status: { $eq: status },
            };
          }
          if (type) {
            queryParamsObj.filters = {
              ...queryParamsObj.filters,
              card_type: { $eq: type },
            };
          }

          const result = await cards.find(queryParamsObj);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  Array.isArray(result) ? result : result?.data || [],
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: "text",
                text: `获取激活卡列表失败: ${error.message}`,
              },
            ],
          };
        }
      }
    );

    // 创建激活卡
    server.tool(
      "create_activation_card",
      "创建激活卡",
      {
        card_type: z.enum(["test", "day", "week", "month", "year", "permanent"]),
        note: z.string().optional(),
        expires_at: z.string().optional(),
        count: z.number().int().min(1).optional(),
      },
      async ({ card_type, note, expires_at, count = 1 }) => {
        try {
          const strapiClient = await getStrapiClient();
          const cards = strapiClient.collection("activation-cards");

          if (count > 1) {
            const activationCards: any[] = [];
            for (let i = 0; i < count; i++) {
              activationCards.push({
                card_type,
                activation_status: "unassigned" as ActivationCardStatus,
                note,
                expires_at,
              });
            }
            const results = await Promise.all(
              activationCards.map((cardData) => cards.create(cardData))
            );
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(results, null, 2),
                },
              ],
            };
          } else {
            const cardData: any = {
              card_type,
              activation_status: "unassigned" as ActivationCardStatus,
              note,
              expires_at,
            };
            const result = await cards.create(cardData);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }
        } catch (error: any) {
          return {
            content: [
              {
                type: "text",
                text: `创建激活卡失败: ${error.message}`,
              },
            ],
          };
        }
      }
    );

    // 创建并分配激活卡
    server.tool(
      "create_and_assign_activation_card",
      "创建激活卡并立即分配给用户",
      {
        card_type: z.enum(["test", "day", "week", "month", "year", "permanent"]),
        user_id: z.string().optional(),
        note: z.string().optional(),
        expires_at: z.string().optional(),
      },
      async ({ card_type, user_id, note, expires_at }) => {
        try {
          const strapiClient = await getStrapiClient();
          const cards = strapiClient.collection("activation-cards");

          const cardData: any = {
            card_type,
            activation_status: user_id
              ? ("assigned" as ActivationCardStatus)
              : ("unassigned" as ActivationCardStatus),
            note,
            expires_at,
          };

          if (user_id) {
            cardData.user_id = user_id;
          }

          const createResponse: any = await cards.create(cardData);
          const createdCard: any = createResponse?.data || createResponse;

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(createdCard, null, 2),
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: "text",
                text: `创建并分配激活卡失败: ${error.message}`,
              },
            ],
          };
        }
      }
    );

    // 使用激活卡（通过 documentId）
    server.tool(
      "use_card_by_document_id",
      "通过 documentId 查询或激活激活卡",
      {
        documentId: z.string(),
        user_id: z.string(),
      },
      async ({ documentId, user_id }) => {
        try {
          const strapiClient = await getStrapiClient();
          const cards = strapiClient.collection("activation-cards");
          const cardData = await cards.findOne(documentId, { populate: "*" });

          const card: ActivationCard =
            (cardData as any)?.data || cardData;
          if (!card) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({ error: "激活码不存在" }),
                },
              ],
            };
          }

          const cardStatus = card.activation_status || "unassigned";

          // 检查过期状态
          if (card.expires_at) {
            const expireDate = new Date(card.expires_at);
            const now = new Date();
            if (now > expireDate && card.activation_status !== "expired") {
              await cards.update(documentId, { activation_status: "expired" });
              return {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify({ error: "激活卡已过期" }),
                  },
                ],
              };
            }
          }

          // 根据状态处理
          if (cardStatus === "unassigned" || (cardStatus === "assigned" && !card.used_at)) {
            // 激活激活卡
            const now = new Date();
            let expires_at = card.expires_at;
            if (!expires_at) {
              const expirationDate = new Date();
              switch (card.card_type) {
                case "test":
                  expirationDate.setHours(now.getHours() + 2);
                  break;
                case "day":
                  expirationDate.setDate(now.getDate() + 1);
                  break;
                case "week":
                  expirationDate.setDate(now.getDate() + 7);
                  break;
                case "month":
                  expirationDate.setMonth(now.getMonth() + 1);
                  break;
                case "year":
                  expirationDate.setFullYear(now.getFullYear() + 1);
                  break;
                case "permanent":
                  expirationDate.setFullYear(now.getFullYear() + 100);
                  break;
              }
              expires_at = expirationDate.toISOString();
            }

            await cards.update(documentId, {
              activation_status: "used",
              used_at: now.toISOString(),
              user_id,
              expires_at,
            });

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    verified: true,
                    message: "激活码激活成功",
                    success: true,
                    card: {
                      id: card.id,
                      code: card.code,
                      card_type: card.card_type,
                      activation_status: "used",
                      used_at: now.toISOString(),
                      expires_at,
                    },
                  }),
                },
              ],
            };
          } else {
            // 验证用户
            const isUserVerified = card.user_id === user_id;
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    verified: isUserVerified,
                    message: isUserVerified
                      ? "用户认证成功，正在使用当前激活码"
                      : "用户认证失败，user_id 不匹配",
                    success: isUserVerified,
                    card: {
                      id: card.id,
                      code: card.code,
                      card_type: card.card_type,
                      activation_status: card.activation_status,
                      used_at: card.used_at,
                      expires_at: card.expires_at,
                    },
                  }),
                },
              ],
            };
          }
        } catch (error: any) {
          return {
            content: [
              {
                type: "text",
                text: `使用激活卡失败: ${error.message}`,
              },
            ],
          };
        }
      }
    );

    // 获取激活卡统计信息
    server.tool(
      "get_activation_cards_stats",
      "获取激活卡统计信息",
      {},
      async () => {
        try {
          const strapiClient = await getStrapiClient();
          const cardsCollection = strapiClient.collection("activation-cards");
          const result = await cardsCollection.find({
            pagination: { pageSize: 1000 },
          });

          const cards: ActivationCard[] = Array.isArray(result)
            ? result
            : (result as any)?.data || [];

          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const stats = {
            total: cards.length,
            unassigned: 0,
            assigned: 0,
            used: 0,
            expired: 0,
            byType: {
              test: 0,
              day: 0,
              week: 0,
              month: 0,
            },
            recentActivity: {
              createdLast7Days: 0,
              assignedLast7Days: 0,
              activatedLast7Days: 0,
            },
          };

          cards.forEach((card: ActivationCard) => {
            switch (card.activation_status) {
              case "unassigned":
                stats.unassigned++;
                break;
              case "assigned":
                stats.assigned++;
                break;
              case "used":
                stats.used++;
                break;
              case "expired":
                stats.expired++;
                break;
            }

            switch (card.card_type) {
              case "test":
                stats.byType.test++;
                break;
              case "day":
                stats.byType.day++;
                break;
              case "week":
                stats.byType.week++;
                break;
              case "month":
                stats.byType.month++;
                break;
            }

            if (card.createdAt) {
              const createdDate = new Date(card.createdAt);
              if (createdDate >= sevenDaysAgo) {
                stats.recentActivity.createdLast7Days++;
              }
            }

            if (card.user_id) {
              stats.recentActivity.assignedLast7Days++;
            }

            if (card.used_at) {
              const activatedDate = new Date(card.used_at);
              if (activatedDate >= sevenDaysAgo) {
                stats.recentActivity.activatedLast7Days++;
              }
            }
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(stats, null, 2),
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: "text",
                text: `获取激活卡统计信息失败: ${error.message}`,
              },
            ],
          };
        }
      }
    );

    // 更新激活卡
    server.tool(
      "update_activation_card",
      "更新激活卡信息（分配、激活、过期）",
      {
        id: z.string(),
        action: z.enum(["assign", "activate", "expire"]),
        user_id: z.string().optional(),
      },
      async ({ id, action, user_id }) => {
        try {
          const strapiClient = await getStrapiClient();
          const cards = strapiClient.collection("activation-cards");

          let updateData: any = {};

          switch (action) {
            case "assign":
              if (!user_id) {
                return {
                  content: [
                    {
                      type: "text",
                      text: JSON.stringify({ error: "缺少user_id参数" }),
                    },
                  ],
                };
              }
              updateData = {
                activation_status: "assigned" as ActivationCardStatus,
                user_id: user_id,
              };
              break;

            case "activate":
              updateData = {
                activation_status: "used" as ActivationCardStatus,
                used_at: new Date().toISOString(),
              };
              break;

            case "expire":
              updateData = {
                activation_status: "expired" as ActivationCardStatus,
              };
              break;
          }

          const result = await cards.update(id, updateData);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: "text",
                text: `更新激活卡失败: ${error.message}`,
              },
            ],
          };
        }
      }
    );

    // 删除激活卡
    server.tool(
      "delete_activation_card",
      "删除激活卡",
      {
        id: z.string(),
      },
      async ({ id }) => {
        try {
          const strapiClient = await getStrapiClient();
          const cards = strapiClient.collection("activation-cards");
          const result = await cards.delete(id);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: "text",
                text: `删除激活卡失败: ${error.message}`,
              },
            ],
          };
        }
      }
    );
  },
  {
    // Optional server options
  },
  {
    // Optional redis config
    redisUrl: process.env.REDIS_URL || process.env.KV_URL,
    basePath: "/api", // this needs to match where the [transport] is located.
    maxDuration: 60,
    verboseLogs: true,
  }
);

// 处理 OPTIONS 请求（CORS preflight）
export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    },
  });
}

// 包装 handler 以添加 CORS headers
async function getWithCors(request: Request) {
  const response = await handler(request);
  return addCorsHeaders(response, request);
}

async function postWithCors(request: Request) {
  const response = await handler(request);
  return addCorsHeaders(response, request);
}

export { getWithCors as GET, postWithCors as POST };
