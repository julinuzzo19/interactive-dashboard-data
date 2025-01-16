import {
  useState,
  useRef,
  MouseEvent,
  useEffect,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export interface TopicInput {
  id: string;
  value: string;
}

export function TopicSelector({
  topics,
  setSelectedTopic,
  selectedTopic,
}: {
  topics: TopicInput[];
  setSelectedTopic: Dispatch<SetStateAction<string>>;
  selectedTopic: string;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollContainerRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;

    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiplicador de velocidad de scroll
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const checkForOverflow = () => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } =
        scrollContainerRef.current;
      setShowRightArrow(
        scrollWidth > clientWidth && scrollWidth - clientWidth - scrollLeft > 10
      );
    }
  };

  useEffect(() => {
    checkForOverflow();
    window.addEventListener("resize", checkForOverflow);
    return () => window.removeEventListener("resize", checkForOverflow);
  }, []);

  const handleScroll = () => {
    checkForOverflow();
  };

  return (
    <div className="relative">
      <div
        ref={scrollContainerRef}
        className={cn(
          "w-full overflow-x-auto cursor-grab select-none",
          isDragging && "cursor-grabbing",
          "scrollbar-hide"
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        onScroll={handleScroll}
      >
        <div className="flex gap-2 py-4 min-w-max px-4">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={(e) => {
                setSelectedTopic(topic.id);
                if (scrollContainerRef.current) {
                  const button = e.currentTarget;
                  const container = scrollContainerRef.current;
                  const scrollLeft = container.scrollLeft;
                  const buttonLeft = button.offsetLeft;
                  const containerWidth = container.clientWidth;
                  const buttonWidth = button.clientWidth;
                  const targetScrollLeft =
                    buttonLeft - containerWidth / 2 + buttonWidth / 2;

                  container.scrollTo({
                    left: targetScrollLeft,
                    behavior: "smooth",
                  });
                }
              }}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                "focus:bg-blue-400",
                selectedTopic === topic.id &&
                  "ring-2 ring-blue-500 ring-offset-2"
              )}
            >
              {topic.value}
            </button>
          ))}
        </div>
      </div>
      {showRightArrow && (
        <div className="absolute right-0 top-0 bottom-0 pointer-events-none flex items-center">
          <div className="w-16 h-full bg-gradient-to-l from-white to-transparent flex items-center justify-end pr-2">
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      )}
    </div>
  );
}
