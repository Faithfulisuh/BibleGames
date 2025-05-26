import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import VerseFragment from './VerseFragment';
import Button from './Button';
import TimerDisplay from './TimerDisplay';

interface VersePuzzleGameProps {
  reference: string;
  fragments: string[];
  onComplete: (result: {
    completed: boolean;
    timeRemaining: number;
    hintsUsed: number;
  }) => void;
  onBack: () => void;
  maxTime?: number; // in seconds
  maxHints?: number;
}

/**
 * VersePuzzleGame component for the Bible Verse Puzzle game
 * Matches the design shown in the game screen
 */
export default function VersePuzzleGame({
  reference,
  fragments,
  onComplete,
  onBack,
  maxTime = 120,
  maxHints = 3,
}: VersePuzzleGameProps) {
  const [remainingTime, setRemainingTime] = useState(maxTime);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [arrangedFragments, setArrangedFragments] = useState<string[]>([]);
  const [availableFragments, setAvailableFragments] = useState<string[]>([...fragments]);
  const [draggedFragment, setDraggedFragment] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDraggingFromArranged, setIsDraggingFromArranged] = useState(false);
  
  // Refs for drop zones
  const dropZoneRefs = useRef<Array<{ y: number, height: number }>>([]);
  const draggedPosition = useRef(new Animated.ValueXY()).current;
  
  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Time's up, complete the game
          onComplete({
            completed: false,
            timeRemaining: 0,
            hintsUsed,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Check if puzzle is completed
  useEffect(() => {
    if (arrangedFragments.length === fragments.length) {
      // Calculate score based on time remaining and hints used
      const timeBonus = Math.floor(remainingTime / maxTime * 500);
      const hintPenalty = hintsUsed * 100;
      const calculatedScore = 500 + timeBonus - hintPenalty;
      
      setScore(calculatedScore > 0 ? calculatedScore : 0);
      
      // Delay to show the completed puzzle before showing results
      const timer = setTimeout(() => {
        onComplete({
          completed: true,
          timeRemaining: remainingTime,
          hintsUsed,
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [arrangedFragments]);

  // Setup pan gesture for dragging fragments
  const panGesture = Gesture.Pan()
    .onStart((event) => {
      // Determine if we're dragging from arranged or available fragments
      // This is a simplified approach - in a real app, you'd use the event coordinates
      // to determine which fragment was touched
      if (draggedIndex !== null && draggedFragment) {
        setIsDraggingFromArranged(true);
      } else {
        setIsDraggingFromArranged(false);
      }
    })
    .onUpdate((event) => {
      // Update position of the dragged fragment
      draggedPosition.setValue({
        x: event.translationX,
        y: event.translationY
      });
    })
    .onEnd((event) => {
      // Find the drop zone where the fragment was dropped
      const { y } = event;
      let dropIndex = -1;
      
      dropZoneRefs.current.forEach((zone, index) => {
        if (y >= zone.y && y <= zone.y + zone.height) {
          dropIndex = index;
        }
      });
      
      // Reset position
      draggedPosition.setValue({ x: 0, y: 0 });
      
      // Handle the drop
      if (dropIndex !== -1 && draggedFragment) {
        if (isDraggingFromArranged) {
          // Moving from one arranged position to another
          if (draggedIndex !== null && draggedIndex !== dropIndex) {
            const newArranged = [...arrangedFragments];
            newArranged.splice(draggedIndex, 1);
            newArranged.splice(dropIndex, 0, draggedFragment);
            setArrangedFragments(newArranged);
          }
        } else {
          // Moving from available to arranged
          // Remove from available fragments
          setAvailableFragments(availableFragments.filter(f => f !== draggedFragment));
          
          // Add to arranged fragments at the drop position
          const newArranged = [...arrangedFragments];
          if (dropIndex >= newArranged.length) {
            newArranged.push(draggedFragment);
          } else {
            newArranged.splice(dropIndex, 0, draggedFragment);
          }
          setArrangedFragments(newArranged);
        }
      } else if (isDraggingFromArranged && draggedIndex !== null && draggedFragment) {
        // Dropped outside a drop zone, move back to available fragments
        const newArranged = [...arrangedFragments];
        newArranged.splice(draggedIndex, 1);
        setArrangedFragments(newArranged);
        setAvailableFragments([...availableFragments, draggedFragment]);
      }
      
      // Reset drag state
      setDraggedFragment(null);
      setDraggedIndex(null);
      setIsDraggingFromArranged(false);
    });
    
  // Handle fragment selection (for non-drag interaction)
  const handleSelectFragment = (fragment: string) => {
    // Remove from available fragments
    setAvailableFragments(availableFragments.filter(f => f !== fragment));
    // Add to arranged fragments
    setArrangedFragments([...arrangedFragments, fragment]);
  };

  // Handle fragment removal (for non-drag interaction)
  const handleRemoveFragment = (index: number) => {
    // Get the fragment
    const fragment = arrangedFragments[index];
    // Remove from arranged fragments
    const newArranged = [...arrangedFragments];
    newArranged.splice(index, 1);
    setArrangedFragments(newArranged);
    // Add back to available fragments
    setAvailableFragments([...availableFragments, fragment]);
  };
  
  // Start dragging a fragment from available fragments
  const handleStartDrag = (fragment: string) => {
    setDraggedFragment(fragment);
  };
  
  // Start dragging a fragment from arranged fragments
  const handleStartDragArranged = (index: number) => {
    setDraggedFragment(arrangedFragments[index]);
    setDraggedIndex(index);
  };
  
  // Register drop zone position
  const registerDropZone = (index: number, y: number, height: number) => {
    if (!dropZoneRefs.current[index]) {
      dropZoneRefs.current[index] = { y, height };
    }
  };

  // Handle hint usage
  const handleUseHint = () => {
    if (hintsUsed < maxHints) {
      setHintsUsed(hintsUsed + 1);
      // Logic for providing a hint (e.g., placing the next correct fragment)
      // This is a simplified example
      const correctOrder = [...fragments].sort(); // In a real app, this would be the correct order
      
      // Find the next correct fragment
      for (let i = 0; i < correctOrder.length; i++) {
        if (i >= arrangedFragments.length || arrangedFragments[i] !== correctOrder[i]) {
          // If we find a mismatch or we're at the end of arranged fragments
          const nextCorrectFragment = correctOrder[i];
          
          // If the fragment is still available, select it
          if (availableFragments.includes(nextCorrectFragment)) {
            handleSelectFragment(nextCorrectFragment);
            break;
          }
        }
      }
    }
  };

  // Handle reset
  const handleReset = () => {
    setArrangedFragments([]);
    setAvailableFragments([...fragments]);
  };

  return (
    <GestureDetector gesture={panGesture}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-purpleGradientStart p-4 flex-row items-center">
          <Pressable onPress={onBack} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="text-white text-xl font-pbold flex-1">Bible Verse Puzzle</Text>
          <Text className="text-white">{reference}</Text>
        </View>

        {/* Game content */}
        <ScrollView className="flex-1 p-4">
          {/* Timer and score */}
          <View className="flex-row justify-between mb-4">
            <TimerDisplay seconds={remainingTime} variant={remainingTime < 30 ? 'warning' : 'default'} />
            <View className="flex-row items-center">
              <Text className="text-textPrimary font-pbold text-lg mr-2">Score</Text>
              <View className="bg-goldAccent px-3 py-1 rounded-lg">
                <Text className="text-textPrimary font-pbold">{score}</Text>
              </View>
              <Pressable className="ml-3" onPress={handleUseHint}>
                <View className="bg-goldAccent px-3 py-1 rounded-lg">
                  <Text className="text-textPrimary font-pbold">{maxHints - hintsUsed}</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Instructions */}
          <Text className="text-textPrimary font-pmedium mb-3">
            Drag and drop the verse fragments in order:
          </Text>

          {/* Drop zones for arranged fragments */}
          <View className="mb-4">
            {[...Array(fragments.length)].map((_, index) => (
              <View 
                key={`drop-${index}`}
                onLayout={(event) => {
                  const { y, height } = event.nativeEvent.layout;
                  registerDropZone(index, y, height);
                }}
              >
                <VerseFragment
                  text={arrangedFragments[index] || ''}
                  isDropZone={!arrangedFragments[index]}
                  onPress={arrangedFragments[index] ? () => handleStartDragArranged(index) : undefined}
                  onLongPress={arrangedFragments[index] ? () => handleRemoveFragment(index) : undefined}
                />
              </View>
            ))}
          </View>

          {/* Available fragments */}
          <View className="bg-white rounded-lg p-4 shadow-sm border border-lightGray border-opacity-20">
            <Text className="text-textPrimary font-pmedium mb-3">Verse Fragments:</Text>
            <View>
              {availableFragments.map((fragment, index) => (
                <VerseFragment
                  key={`fragment-${index}`}
                  text={fragment}
                  onPress={() => handleStartDrag(fragment)}
                  onLongPress={() => handleSelectFragment(fragment)}
                  className="mb-2"
                />
              ))}
            </View>
            <View className="flex-row mt-4">
              <Button
                title="Reset"
                onPress={handleReset}
                variant="outline"
                icon={<Ionicons name="refresh-outline" size={18} color="white" />}
                className="flex-1 mr-2"
              />
              <Button
                title={`Hint (${maxHints - hintsUsed})`}
                onPress={handleUseHint}
                variant="gold"
                icon={<Ionicons name="bulb-outline" size={18} color="white" />}
                className="flex-1 ml-2"
                disabled={hintsUsed >= maxHints}
              />
            </View>
          </View>
          
          {/* Draggable fragment */}
          {draggedFragment && (
            <Animated.View 
              style={[{
                position: 'absolute',
                left: draggedPosition.x,
                top: draggedPosition.y,
                zIndex: 1000,
                width: '80%',
                opacity: 0.9,
              }]}
            >
              <VerseFragment
                text={draggedFragment}
                isDropZone={false}
              />
            </Animated.View>
          )}
          
          {/* Bottom padding for scrolling */}
          <View className="h-20" />
        </ScrollView>
      </View>
    </GestureDetector>
  );
}
