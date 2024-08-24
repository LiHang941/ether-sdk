"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENDLESS = exports.invariant = void 0;
function invariant(state, errorMsg = 'ERROR') {
    if (!state)
        throw new Error(errorMsg);
}
exports.invariant = invariant;
exports.ENDLESS = '∞';
