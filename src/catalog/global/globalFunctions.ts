import { removeComments, toMs, ensureInlineBlockIfNeeded, parseAnimString,  mapEventName, parseProperties  } from '../../extras/basics.js';

/**
 * * Global functions: works on any property -- for example, reset() resets element final state to the state before animation, searchValue() returns a variable value, etc.
 */
export const global = {
    /**
     * TODO: Returns a variable value
    */
    searchValue: (el: HTMLElement, args: string): void => {
        const parts: any = args ? args.split(',').map((p: any) => p.trim()) : [];
    },
    /**
     * TODO: Return element state after animation's done to base state on it. For example, if the element is hidden, then hide it after animation's done, not before. 
    */
    reset: (el: HTMLElement): void => {
        
    }
}