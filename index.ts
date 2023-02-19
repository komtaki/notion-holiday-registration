import { Client } from "@notionhq/client";
import { config } from "dotenv";

config();

const HOLIDAY_API_URL = "https://holidays-jp.github.io/api/v1/date.json";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const createNotionPayload = (date: string, name: string) => ({
  parent: {
    type: "database_id",
    database_id: process.env.NOTION_DATABASE_ID,
  },
  properties: {
    カテゴリ: {
      id: "ZlE%5D",
      type: "select",
      select: {
        id: "3009617e-943d-4348-93ef-36449dfb7c93",
        name: "祝日",
      },
    },
    日付: {
      id: "d%3Fq%3B",
      type: "date",
      date: {
        start: date,
        end: null,
        time_zone: null,
      },
    },
    タスク名: {
      id: "title",
      type: "title",
      title: [
        {
          type: "text",
          text: {
            content: name,
          },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: "default",
          },
          plain_text: name,
        },
      ],
    },
  },
});

(async () => {
  const res = await fetch(HOLIDAY_API_URL);
  if (!res.ok) {
    console.error("Failed to get holiday data.");
    return;
  }

  const holidayData: { [key: string]: string } = await res.json();

  const keys = Object.keys(holidayData);
  const currentDate = new Date();

  for (let i = 0; i < keys.length; i++) {
    const dateKey = keys[i];
    const holidayDate = new Date(dateKey);
    // 登録日以前の祝日は登録不要なのでスキップ
    if (holidayDate < currentDate) {
      continue;
    }
    await notion.pages.create(
      createNotionPayload(dateKey, holidayData[dateKey]) as any
    );
    if (!res.ok) {
      console.error("Failed to register holiday data.");
      return;
    }
    console.log(
      `Success to register holiday data.${keys[i]} ${holidayData[keys[i]]}`
    );
  }
})();
