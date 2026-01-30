export type Role = "DE" | "DS" | "DA";

export type TopicNode = {
  id: string;
  role: Role;
  label: string;

  parentId?: string;
  childrenIds: string[];

  level: number; // computed / stored for convenience
  metrics?: {
    band: 1 | 2 | 3 | 4 | 5;
    trend: "up" | "down" | "flat";
    attempts: number;
    lastPracticedAt?: number;
  };
};

export type TopicSelectionState = "explicit" | "implicit";

export type TopicSelection = {
  topicId: string;
  state: TopicSelectionState;
  includeChildren?: boolean; // only for explicit
};

export type SelectionMap = Record<string, TopicSelection>;

export type TopicsState = {
  selectedRoles: Role[];      // multi-select allowed
  activeRole: Role;           // focused role context
  selectionByRole: Record<Role, SelectionMap>;
  includeChildrenByRole: Record<Role, Record<string, boolean>>; // explicit topicId -> includeChildren
  customTopicsByRole: Record<Role, TopicNode[]>; // added via + Add topic
};

export type LevelView = {
  level: number;
  topicIds: string[];
};
