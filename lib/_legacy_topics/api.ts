import { TopicTree } from "../topics/types";
import { MOCK_TOPIC_TREE } from "@/lib/mock/topicTree";

export async function fetchTopicTree(): Promise<TopicTree> {
  // simulate latency
  await new Promise((r) => setTimeout(r, 250));

  // simulate occasional failure (comment out if annoying)
  // if (Math.random() < 0.05) throw new Error("topic_tree_load_failed");

  return MOCK_TOPIC_TREE;
}
