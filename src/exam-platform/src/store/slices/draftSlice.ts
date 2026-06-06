import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Draft system is being removed.
 *
 * Some admin pages still import these action creators during the migration.
 * Keep lightweight no-op/thin slice exports so builds/typecheck pass
 * until those pages are fully migrated to localStorage autosave.
 */

export type DraftStatusValue = "idle" | "saving" | "saved" | "error";

type DraftState = {
  status: DraftStatusValue;
  draftId?: number;
  examDraftId?: number;
};

const initialState: DraftState = {
  status: "idle",
};

const draftSlice = createSlice({
  name: "drafts",
  initialState,
  reducers: {
    setDraftStatus: (state, action: PayloadAction<DraftStatusValue>) => {
      state.status = action.payload;
    },
    setDraftSaved: (state) => {
      state.status = "saved";
    },
    setExamDraftId: (state, action: PayloadAction<number>) => {
      state.examDraftId = action.payload;
    },
    markUnsaved: (state) => {
      state.status = "idle";
    },
    resetDraft: (state) => {
      state.status = "idle";
      state.draftId = undefined;
      state.examDraftId = undefined;
    },
  },
});

export const {
  setDraftStatus,
  setDraftSaved,
  setExamDraftId,
  markUnsaved,
  resetDraft,
} = draftSlice.actions;

export default draftSlice.reducer;
