import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Text } from "react-native-paper";

type ChatMessage = {
  id: number;
  role: "ai" | "user";
  text: string;
};

const suggestions = ["매운 정도", "환전", "채식 가능?", "화장실"];

const cannedAnswers = [
  {
    keys: ["맵", "매운", "spicy"],
    answer:
      "돼지국밥·순대국밥은 순한 편이고, 물밀면은 양념장을 섞으면 매울 수 있어요. 주문 카드에서 덜 맵게 옵션을 켜두면 안전합니다.",
  },
  {
    keys: ["환전", "환율", "currency", "exchange"],
    answer:
      "메뉴 화면에서 KRW/TWD/JPY/CNY/USD 가격을 바로 바꿔볼 수 있어요. 실제 결제 전에는 매장 카드 결제 가능 여부도 확인해보세요.",
  },
  {
    keys: ["채식", "베지", "vegetarian", "vegan"],
    answer:
      "국밥류는 보통 고기 육수 기반이라 완전 채식에는 맞지 않을 수 있어요. 알레르기/재료 그리드를 보고 직원에게 한 번 더 확인하는 게 좋아요.",
  },
  {
    keys: ["화장실", "toilet", "restroom"],
    answer:
      "시장 안쪽 매장은 공용 화장실을 안내하는 경우가 많아요. 말하기 카드가 추가되면 '화장실이 어디예요?'를 바로 보여줄 수 있게 만들면 좋습니다.",
  },
  {
    keys: ["카드", "결제", "card", "payment"],
    answer:
      "일부 시장 매장은 카드 결제가 가능하지만, 현금만 받는 곳도 있어요. 결제 전에 '카드 결제 되나요?'라고 확인해보세요.",
  },
];

function answerQuestion(question: string): string {
  const normalized = question.toLowerCase();
  const hit = cannedAnswers.find((item) =>
    item.keys.some((key) => normalized.includes(key.toLowerCase()))
  );

  return (
    hit?.answer ??
    "아직 준비된 답변이 없는 질문이에요. 실제 서비스에서는 이 자리에 실시간 AI 여행 도우미를 연결하면 됩니다."
  );
}

export default function ChatBotOverlay() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "ai",
      text: "부산 시장에서 메뉴·결제·알레르기처럼 헷갈리는 걸 물어보세요.",
    },
  ]);

  const ask = (question: string) => {
    const clean = question.trim();
    if (!clean) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: clean },
      { id: Date.now() + 1, role: "ai", text: answerQuestion(clean) },
    ]);
  };

  if (!open) {
    return (
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      >
        <Text variant="titleMedium" style={styles.fabText}>
          AI
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View>
          <Text variant="titleMedium" style={styles.title}>
            부산한입 AI
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            demo assistant · keyword answers
          </Text>
        </View>
        <Pressable onPress={() => setOpen(false)} style={styles.closeButton}>
          <Text variant="titleMedium" style={styles.closeText}>
            ×
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.bubble,
              message.role === "user" ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text
              variant="bodySmall"
              style={[
                styles.bubbleText,
                message.role === "user" && styles.userBubbleText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionRow}
      >
        {suggestions.map((suggestion) => (
          <Pressable
            key={suggestion}
            onPress={() => ask(suggestion)}
            style={styles.suggestion}
          >
            <Text variant="labelSmall" style={styles.suggestionText}>
              {suggestion}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="질문 입력"
          placeholderTextColor="#8b7fa0"
          style={styles.input}
          onSubmitEditing={() => ask(input)}
        />
        <Pressable onPress={() => ask(input)} style={styles.sendButton}>
          <Text variant="labelMedium" style={styles.sendText}>
            전송
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 18,
    zIndex: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1030",
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  fabText: {
    color: "#EC008C",
  },
  panel: {
    position: "absolute",
    zIndex: 30,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#fbf8ff",
  },
  header: {
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e4d9f5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#1a1030",
  },
  subtitle: {
    color: "#8b7fa0",
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#8b7fa0",
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 14,
    gap: 10,
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e4d9f5",
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#1a1030",
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    color: "#1a1030",
    lineHeight: 19,
  },
  userBubbleText: {
    color: "#fbf8ff",
  },
  suggestionRow: {
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  suggestion: {
    borderWidth: 1.4,
    borderColor: "#e4d9f5",
    backgroundColor: "#ffffff",
    borderRadius: 100,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  suggestionText: {
    color: "#1a1030",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: "#e4d9f5",
  },
  input: {
    flex: 1,
    borderWidth: 1.4,
    borderColor: "#e4d9f5",
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: "#1a1030",
    backgroundColor: "#ffffff",
    fontSize: 13,
  },
  sendButton: {
    borderRadius: 100,
    backgroundColor: "#1a1030",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  sendText: {
    color: "#EC008C",
  },
  pressed: {
    opacity: 0.82,
  },
});
