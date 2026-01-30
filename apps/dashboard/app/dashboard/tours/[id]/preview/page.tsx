'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, X } from 'lucide-react';
import Link from 'next/link';

interface Step {
  id: string;
  title: string;
  description: string;
  selector: string;
  script: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightPosition?: {
    top: number | string;
    left: number | string;
    width: number | string;
    height: number | string;
  };
}

interface Page {
  id: string;
  url: string;
  title: string;
  steps: Step[];
}

interface Tour {
  id: string;
  name: string;
  description: string;
  pages: Page[];
}

export default function TourPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState<{ top: number | string; left: number | string; width: number | string; height: number | string } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Calculate current page and step (must be before useEffects that use them)
  const currentPage = tour?.pages[currentPageIndex];
  const currentStep = currentPage?.steps[currentStepIndex];
  const totalSteps = tour?.pages.reduce((sum, page) => sum + page.steps.length, 0) || 0;
  const currentStepNumber =
    (tour?.pages.slice(0, currentPageIndex).reduce((sum, page) => sum + page.steps.length, 0) || 0) +
    currentStepIndex +
    1;

  const isFirstStep = currentPageIndex === 0 && currentStepIndex === 0;
  const isLastStep =
    tour && currentPageIndex === tour.pages.length - 1 &&
    currentPage && currentStepIndex === currentPage.steps.length - 1;

  useEffect(() => {
    loadTour();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isLastStep) {
        nextStep();
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        previousStep();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPageIndex, currentStepIndex, isPlaying]);

  // Check for completion
  useEffect(() => {
    if (tour && currentPageIndex === tour.pages.length - 1) {
      const currentPage = tour.pages[currentPageIndex];
      if (currentPage && currentStepIndex === currentPage.steps.length - 1) {
        setShowCompletion(true);
      }
    }
  }, [currentPageIndex, currentStepIndex, tour]);

  // Play narration when step changes (if widget is open and playing)
  useEffect(() => {
    if (widgetOpen && isPlaying && currentStep) {
      playStepNarration(currentStep.script);
    }
  }, [currentPageIndex, currentStepIndex, widgetOpen, isPlaying]);

  // Update highlight position based on step position
  useEffect(() => {
    if (currentStep && (widgetOpen || isEditMode)) {
      // Use saved highlight position if available
      if (currentStep.highlightPosition) {
        setHighlightPosition(currentStep.highlightPosition as any);
      } else if (isEditMode) {
        // Only show default highlight positions in edit mode, not during regular preview
        const position = currentStep.position || 'center';
        let highlightStyle = null;

        switch (position) {
          case 'top':
            highlightStyle = { top: 80, left: '50%', width: 300, height: 150 };
            break;
          case 'bottom':
            highlightStyle = { top: 'calc(100% - 230px)' as any, left: '50%', width: 300, height: 150 };
            break;
          case 'left':
            highlightStyle = { top: '50%', left: 80, width: 250, height: 200 };
            break;
          case 'right':
            highlightStyle = { top: '50%', left: 'calc(100% - 330px)' as any, width: 250, height: 200 };
            break;
          case 'center':
          default:
            highlightStyle = { top: '50%', left: '50%', width: 350, height: 250 };
            break;
        }

        setHighlightPosition(highlightStyle as any);
      } else {
        // In preview mode, if no saved position exists, don't show highlight
        setHighlightPosition(null);
      }
    } else {
      setHighlightPosition(null);
    }
  }, [currentStep, widgetOpen, isEditMode, currentPageIndex, currentStepIndex]);

  // Convert percentage positions to pixels when entering edit mode or when widget opens
  useEffect(() => {
    if ((isEditMode || widgetOpen) && highlightPosition) {
      // Check if we need to convert percentage/calc values to pixels
      const needsConversion =
        (typeof highlightPosition.top === 'string') ||
        (typeof highlightPosition.left === 'string') ||
        (typeof highlightPosition.width === 'string') ||
        (typeof highlightPosition.height === 'string');

      if (!needsConversion) return;

      // Convert percentage/calc values to actual pixel values
      const container = document.querySelector('.preview-area-container');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      let newPosition = { ...highlightPosition };
      let changed = false;

      // Convert top position (handle any percentage value)
      if (typeof highlightPosition.top === 'string') {
        if (highlightPosition.top.includes('%')) {
          const percent = parseFloat(highlightPosition.top);
          newPosition.top = (rect.height * percent / 100);
          changed = true;
        } else if (highlightPosition.top.includes('calc')) {
          // For bottom position: calc(100% - 230px)
          newPosition.top = rect.height - 230;
          changed = true;
        }
      }

      // Convert left position (handle any percentage value)
      if (typeof highlightPosition.left === 'string') {
        if (highlightPosition.left.includes('%')) {
          const percent = parseFloat(highlightPosition.left);
          newPosition.left = (rect.width * percent / 100);
          changed = true;
        } else if (highlightPosition.left.includes('calc')) {
          // For right position: calc(100% - 330px)
          newPosition.left = rect.width - 330;
          changed = true;
        }
      }

      // Convert width percentage to pixels
      if (typeof highlightPosition.width === 'string' && highlightPosition.width.includes('%')) {
        const percent = parseFloat(highlightPosition.width);
        newPosition.width = (rect.width * percent / 100);
        changed = true;
      }

      // Convert height percentage to pixels
      if (typeof highlightPosition.height === 'string' && highlightPosition.height.includes('%')) {
        const percent = parseFloat(highlightPosition.height);
        newPosition.height = (rect.height * percent / 100);
        changed = true;
      }

      if (changed) {
        setHighlightPosition(newPosition);
      }
    }
  }, [isEditMode, widgetOpen, currentStep, highlightPosition]);

  // Mouse event listeners for drag and resize
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, dragOffset, highlightPosition]);

  async function loadTour() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      const { data: tourData, error: tourError } = await supabase
        .from('tours')
        .select('*')
        .eq('id', params.id)
        .eq('client_id', client?.id)
        .single();

      if (tourError) throw tourError;
      setTour(tourData);
    } catch (err: any) {
      setError(err.message || 'Failed to load tour');
    } finally {
      setLoading(false);
    }
  }

  async function playStepNarration(script: string) {
    try {
      setIsLoadingAudio(true);
      setIsNarrating(true);

      // Stop any currently playing audio
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }

      // Call TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: script }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      // Create audio from response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Handle audio events
      audio.onended = () => {
        setIsNarrating(false);
        URL.revokeObjectURL(audioUrl);
        // Auto-advance to next step after a brief pause
        setTimeout(() => {
          if (isPlaying) {
            nextStep();
          }
        }, 1000); // 1 second pause between steps
      };

      audio.onerror = () => {
        setIsNarrating(false);
        setError('Failed to play audio');
        URL.revokeObjectURL(audioUrl);
      };

      audio.onloadeddata = () => {
        setIsLoadingAudio(false);
      };

      setAudioElement(audio);
      await audio.play();
    } catch (err: any) {
      console.error('Narration error:', err);
      setIsNarrating(false);
      setIsLoadingAudio(false);
    }
  }

  function stopNarration() {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    setIsNarrating(false);
  }

  function nextStep() {
    if (!tour) return;

    stopNarration();
    const currentPage = tour.pages[currentPageIndex];
    if (currentStepIndex < currentPage.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else if (currentPageIndex < tour.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      setCurrentStepIndex(0);
    } else {
      // Tour completed
      setIsNarrating(false);
    }
  }

  function previousStep() {
    stopNarration();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      const previousPage = tour?.pages[currentPageIndex - 1];
      setCurrentStepIndex(previousPage ? previousPage.steps.length - 1 : 0);
    }
  }

  function restartTour() {
    stopNarration();
    setCurrentPageIndex(0);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setIsNarrating(false);
    setShowCompletion(false);
    setWidgetOpen(false);
  }

  function handleMouseDown(e: React.MouseEvent, action: 'drag' | 'resize') {
    if (!isEditMode || !highlightPosition) return;
    e.preventDefault();
    e.stopPropagation();

    if (action === 'drag') {
      setIsDragging(true);
      // Calculate offset between mouse position and element's top-left corner
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    } else {
      setIsResizing(true);
    }

    setDragStart({ x: e.clientX, y: e.clientY });
  }

  function handleMouseMove(e: MouseEvent) {
    if (!highlightPosition) return;

    // Get container offset to convert viewport coordinates to container-relative coordinates
    const container = document.querySelector('.preview-area-container');
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    if (isDragging) {
      // Position element so the point where the user clicked stays under the cursor
      // Convert viewport coordinates to container-relative coordinates
      setHighlightPosition(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          top: e.clientY - containerRect.top - dragOffset.y,
          left: e.clientX - containerRect.left - dragOffset.x,
        };
      });

      setHasUnsavedChanges(true);
    } else if (isResizing) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setHighlightPosition(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          width: Math.max(100, (prev.width as number) + deltaX),
          height: Math.max(80, (prev.height as number) + deltaY),
        };
      });

      setDragStart({ x: e.clientX, y: e.clientY });
      setHasUnsavedChanges(true);
    }
  }

  function handleMouseUp() {
    setIsDragging(false);
    setIsResizing(false);
  }

  async function saveHighlightPosition() {
    if (!tour || !currentStep || !highlightPosition) return;

    try {
      // Convert pixel positions to percentages for responsive storage
      const container = document.querySelector('.preview-area-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();

      const topPercent = ((highlightPosition.top as number) / rect.height) * 100;
      const leftPercent = ((highlightPosition.left as number) / rect.width) * 100;
      const widthPercent = ((highlightPosition.width as number) / rect.width) * 100;
      const heightPercent = ((highlightPosition.height as number) / rect.height) * 100;

      // Update the step in the database with new highlight position (as percentages)
      const updatedPages = [...tour.pages];
      const pageIndex = currentPageIndex;
      const stepIndex = currentStepIndex;

      updatedPages[pageIndex].steps[stepIndex] = {
        ...currentStep,
        highlightPosition: {
          top: `${topPercent}%`,
          left: `${leftPercent}%`,
          width: `${widthPercent}%`,
          height: `${heightPercent}%`,
        },
      };

      const { error } = await supabase
        .from('tours')
        .update({ pages: updatedPages })
        .eq('id', tour.id);

      if (error) throw error;

      // Update local state
      setTour({ ...tour, pages: updatedPages });
      setHasUnsavedChanges(false);
      alert('✅ Highlight position saved!');
    } catch (err: any) {
      console.error('Save error:', err);
      setError('Failed to save highlight position');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="text-center bg-white rounded-xl shadow-xl p-12 border-2 border-primary-200">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 font-medium">✨ Loading your tour preview...</p>
          <p className="text-sm text-gray-500 mt-2">Just a moment!</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 p-8">
        <div className="text-center bg-white rounded-xl shadow-xl p-12 border-2 border-red-300 max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Can't Load This Tour</h2>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find this tour. It might have been deleted or you don't have permission to view it."}
          </p>
          <Link
            href="/dashboard/tours"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold shadow-md"
          >
            ← Back to All Tours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Completion Celebration Modal */}
      {showCompletion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md mx-4 text-center transform animate-scale-in">
            <div className="text-7xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              You Did It!
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              You've completed the entire tour! Your users will love this! 🚀
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCompletion(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowCompletion(false);
                  restartTour();
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-lg hover:from-primary-700 hover:to-blue-700 transition font-semibold shadow-md"
              >
                🔄 Watch Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 border-b-4 border-primary-700 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/tours/${tour.id}`}
              className="text-white hover:text-primary-100 transition"
              title="Back to tour details"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                👀 {tour.name}
              </h1>
              <p className="text-sm text-primary-100">
                Preview Mode • Step {currentStepNumber} of {totalSteps}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition shadow-md ${
                isEditMode
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-white text-primary-700 hover:bg-primary-50'
              }`}
            >
              {isEditMode ? '✏️ Editing Highlights' : '🎯 Edit Highlights'}
            </button>
            {hasUnsavedChanges && (
              <button
                onClick={saveHighlightPosition}
                className="px-4 py-2 text-sm bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-md animate-pulse"
              >
                💾 Save Position
              </button>
            )}
            <button
              onClick={restartTour}
              className="px-4 py-2 text-sm bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition shadow-md"
            >
              🔄 Restart
            </button>
          </div>
        </div>
      </div>

      {/* Helpful Banner */}
      {currentPageIndex === 0 && currentStepIndex === 0 && !widgetOpen && (
        <div className="bg-yellow-50 border-b-2 border-yellow-300 px-6 py-3">
          <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
            <span className="text-xl">💡</span>
            <p className="text-yellow-900 font-medium">
              This shows how Narrify looks on your website! Click the floating Narrify button (bottom-right) to start the AI tour!
            </p>
          </div>
        </div>
      )}

      {/* Preview Area - Website with Narrify Widget */}
      <div className="flex-1 relative overflow-hidden preview-area-container" style={{ height: 'calc(100vh - 280px)' }}>
        {/* Website Iframe */}
        <div className="absolute inset-0">
          <iframe
            src={currentPage?.url || ''}
            className="w-full h-full border-0"
            title="Website Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        {/* Element Highlight Overlay */}
        {highlightPosition && (widgetOpen || isEditMode) && (
          <div
            className={`absolute z-40 ${
              isEditMode ? 'pointer-events-auto cursor-move' : 'pointer-events-none'
            } ${!isEditMode && 'transition-all duration-500'}`}
            style={{
              top: typeof highlightPosition.top === 'number' ? highlightPosition.top + 'px' : highlightPosition.top,
              left: typeof highlightPosition.left === 'number' ? highlightPosition.left + 'px' : highlightPosition.left,
              width: typeof highlightPosition.width === 'number' ? highlightPosition.width + 'px' : highlightPosition.width,
              height: typeof highlightPosition.height === 'number' ? highlightPosition.height + 'px' : highlightPosition.height,
              // Only apply transform for default positions, not saved custom positions
              transform: (isEditMode || currentStep?.highlightPosition) ? 'none' : 'translate(-50%, -50%)',
            }}
            onMouseDown={(e) => handleMouseDown(e, 'drag')}
          >
            {/* Pulsing glow effect */}
            <div className={`absolute inset-0 border-4 ${isEditMode ? 'border-blue-500' : 'border-yellow-400'} rounded-lg ${!isEditMode && 'animate-pulse'} shadow-2xl`}>
              <div className={`absolute inset-0 ${isEditMode ? 'bg-blue-500/20' : 'bg-yellow-400/20'} rounded-lg`}></div>
            </div>

            {/* Edit mode controls */}
            {isEditMode && (
              <>
                {/* Instructions */}
                <div className="absolute -top-12 left-0 bg-blue-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap font-medium">
                  🎯 Drag to move • Resize from corner
                </div>

                {/* Resize handle */}
                <div
                  className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 border-2 border-white rounded-full cursor-se-resize shadow-lg hover:bg-blue-600 transition"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, 'resize');
                  }}
                >
                  <svg className="w-full h-full text-white p-1" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M14 14V6l-1 1v6H7l-1 1h8z"/>
                    <path d="M4 10V2h8v8H4z"/>
                  </svg>
                </div>

                {/* Size indicator */}
                <div className="absolute -bottom-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg">
                  {Math.round(highlightPosition.width as number)} × {Math.round(highlightPosition.height as number)}px
                </div>
              </>
            )}

            {/* Animated corners (only show when not editing) */}
            {!isEditMode && (
              <>
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-yellow-500 rounded-tl-lg animate-pulse"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-yellow-500 rounded-tr-lg animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-yellow-500 rounded-bl-lg animate-pulse"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-yellow-500 rounded-br-lg animate-pulse"></div>

                {/* Spotlight effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-yellow-400/30 blur-xl animate-pulse"></div>
              </>
            )}
          </div>
        )}

        {/* Narrify Widget Overlay */}
        <div className="absolute bottom-6 right-6 z-50">
          {!widgetOpen ? (
            /* Floating Button */
            <button
              onClick={() => {
                setWidgetOpen(true);
                setIsPlaying(true);
                // Let the useEffect handle starting narration
              }}
              className="group relative w-16 h-16 bg-gradient-to-r from-primary-600 to-blue-600 rounded-full shadow-2xl hover:shadow-primary-500/50 transition-all hover:scale-110 flex items-center justify-center animate-pulse"
            >
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs font-bold text-white">1</span>
              </div>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                🎯 Start Narrify Tour
                <div className="absolute top-full right-4 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </button>
          ) : (
            /* AI Voice Widget */
            <div className="w-96 bg-white rounded-2xl shadow-2xl border-2 border-primary-300 overflow-hidden transform transition-all duration-300 scale-100">
              {/* Widget Header */}
              <div className="bg-gradient-to-r from-primary-600 to-blue-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Narrify AI Guide</h3>
                    <p className="text-primary-100 text-xs">Your interactive tour assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setWidgetOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Widget Content */}
              <div className="p-6 bg-gray-50 max-h-96 overflow-y-auto">
                {/* Current Step Being Narrated */}
                {currentStep && (
                  <div className="space-y-4">
                    {/* AI Avatar */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="bg-white rounded-xl px-4 py-3 shadow-md border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                              Step {currentStepNumber} of {totalSteps}
                            </span>
                            {isLoadingAudio ? (
                              <span className="flex items-center gap-1 text-xs text-blue-600">
                                <div className="w-2 h-2 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                Loading...
                              </span>
                            ) : isNarrating ? (
                              <span className="flex items-center gap-1 text-xs text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Speaking...
                              </span>
                            ) : null}
                          </div>
                          <h4 className="font-bold text-gray-900 mb-1">{currentStep.title}</h4>
                          {currentStep.description && (
                            <p className="text-sm text-gray-600 mb-2">{currentStep.description}</p>
                          )}
                          <div className="bg-blue-50 border-l-4 border-blue-500 px-3 py-2 rounded mt-2">
                            <p className="text-sm text-gray-800">
                              {isNarrating ? (
                                <span className="inline-flex items-center gap-2">
                                  🔊 "{currentStep.script}"
                                </span>
                              ) : (
                                currentStep.script
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Highlight Indicator */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 ml-11">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span>Highlighting: <code className="bg-gray-200 px-2 py-1 rounded font-mono">{currentStep.selector}</code></span>
                    </div>

                    {/* Progress */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 ml-11">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span className="font-medium">Tour Progress</span>
                        <span>{Math.round((currentStepNumber / totalSteps) * 100)}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-full h-2 transition-all"
                          style={{ width: `${(currentStepNumber / totalSteps) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-300 px-6 py-5 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          {/* Instruction */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              {!widgetOpen ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">👆</span>
                  <strong>Click the Narrify button</strong> in the bottom-right corner to start the tour!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">🎧</span>
                  Use these controls to navigate through the AI voice tour
                </span>
              )}
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={previousStep}
                disabled={isFirstStep || !widgetOpen}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-primary-500 transition disabled:opacity-30 disabled:cursor-not-allowed font-medium text-gray-700"
                title="Go to previous step"
              >
                <SkipBack className="w-4 h-4" />
                <span className="text-sm">Previous</span>
              </button>
              <button
                onClick={() => {
                  if (!widgetOpen) {
                    setWidgetOpen(true);
                  }

                  if (isPlaying) {
                    // Pause
                    stopNarration();
                    setIsPlaying(false);
                  } else {
                    // Play - let the useEffect handle starting narration
                    setIsPlaying(true);
                  }
                }}
                disabled={isLoadingAudio}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-lg hover:from-primary-700 hover:to-blue-700 transition shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                title={isPlaying ? 'Pause AI narration' : 'Start AI narration'}
              >
                {isLoadingAudio ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause AI</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Play AI</span>
                  </>
                )}
              </button>
              <button
                onClick={nextStep}
                disabled={isLastStep || !widgetOpen}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-primary-500 transition disabled:opacity-30 disabled:cursor-not-allowed font-medium text-gray-700"
                title="Go to next step"
              >
                <span className="text-sm">Next</span>
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={restartTour}
                className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
              >
                🔄 Restart Tour
              </button>
              <div className="text-sm font-semibold text-gray-700 bg-white px-4 py-2 rounded-lg border-2 border-gray-300 shadow-sm">
                Step {currentStepNumber} of {totalSteps}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="bg-gray-300 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-full h-3 transition-all shadow-md"
                style={{
                  width: `${(currentStepNumber / totalSteps) * 100}%`,
                }}
              ></div>
            </div>
            <div className="text-xs text-center text-gray-500 mt-1">
              {Math.round((currentStepNumber / totalSteps) * 100)}% Complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
