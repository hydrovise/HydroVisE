import { useEffect, useRef } from 'react';

export const useDraggable = (
  elementRef: React.RefObject<HTMLElement | HTMLDivElement | null>,
  dragHandle?: React.RefObject<HTMLElement | HTMLDivElement | null>
) => {
  const dragData = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0
  });

  useEffect(() => {
    // Use a small delay to ensure refs are properly set
    const timer = setTimeout(() => {
      const element = elementRef.current;
      const handle = dragHandle?.current || element;
      
      if (!element || !handle) {
        console.warn('Draggable elements not found:', { element, handle });
        return;
      }

      const onMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);
        
        dragData.current = {
          isDragging: true,
          startX: e.clientX,
          startY: e.clientY,
          initialLeft: parseInt(computedStyle.left) || rect.left,
          initialTop: parseInt(computedStyle.top) || rect.top
        };

        // Ensure element has absolute positioning
        if (computedStyle.position !== 'absolute' && computedStyle.position !== 'fixed') {
          element.style.position = 'absolute';
          element.style.left = rect.left + 'px';
          element.style.top = rect.top + 'px';
        }
        
        // Add visual feedback
        element.style.zIndex = '9999';
        handle.style.cursor = 'grabbing';
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!dragData.current.isDragging) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const deltaX = e.clientX - dragData.current.startX;
        const deltaY = e.clientY - dragData.current.startY;
        
        const newLeft = dragData.current.initialLeft + deltaX;
        const newTop = dragData.current.initialTop + deltaY;
        
        // Boundary constraints
        const maxLeft = Math.max(0, window.innerWidth - element.offsetWidth);
        const maxTop = Math.max(0, window.innerHeight - element.offsetHeight);
        
        const constrainedLeft = Math.max(0, Math.min(newLeft, maxLeft));
        const constrainedTop = Math.max(0, Math.min(newTop, maxTop));
        
        element.style.left = constrainedLeft + 'px';
        element.style.top = constrainedTop + 'px';
      };

      const onMouseUp = (e: MouseEvent) => {
        if (dragData.current.isDragging) {
          e.preventDefault();
          e.stopPropagation();
          
          // Reset visual feedback
          element.style.zIndex = '30'; // Reset to original z-index
          handle.style.cursor = 'move';
        }
        dragData.current.isDragging = false;
      };

      // Add event listeners
      handle.addEventListener('mousedown', onMouseDown, { passive: false });
      document.addEventListener('mousemove', onMouseMove, { passive: false });
      document.addEventListener('mouseup', onMouseUp, { passive: false });

      // Store references for cleanup
      const currentHandle = handle;
      
      // Return cleanup function that will be called when timer is cleared
      return () => {
        currentHandle.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    }, 100); // Small delay to ensure refs are set

    return () => {
      clearTimeout(timer);
    };
  }, [elementRef, dragHandle]);

  return {
    isDragging: dragData.current.isDragging
  };
};
