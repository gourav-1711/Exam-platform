import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type DraftStatus = "idle" | "saving" | "saved" | "error";

interface DraftState {
  questionDraftId: number | null;
  examDraftId: number | null;
  status: DraftStatus;
  lastSavedAt: string | null;
  hasUnsavedChanges: boolean;
  errorMessage: string | null;
}

const initialState: DraftState = {
  questionDraftId: null,
  examDraftId: null,
  status: "idle",
  lastSavedAt: null,
  hasUnsavedChanges: false,
  errorMessage: null,
};

const draftSlice = createSlice({
  name: "draft",
  initialState,
  reducers: {
    setQuestionDraftId(state, action: PayloadAction<number | null>) {
      state.questionDraftId = action.payload;
    },
    setExamDraftId(state, action: PayloadAction<number | null>) {
      state.examDraftId = action.payload;
    },
    setDraftStatus(state, action: PayloadAction<DraftStatus>) {
      state.status = action.payload;
      if (action.payload === "error") {
        state.errorMessage = "Failed to save draft";
      } else {
        state.errorMessage = null;
      }
    },
    setDraftSaved(state) {
      state.status = "saved";
      state.lastSavedAt = new Date().toISOString();
      state.hasUnsavedChanges = false;
      state.errorMessage = null;
    },
    markUnsaved(state) {
      state.hasUnsavedChanges = true;
    },
    resetDraft(state) {
      state.questionDraftId = null;
      state.examDraftId = null;
      state.status = "idle";
      state.lastSavedAt = null;
      state.hasUnsavedChanges = false;
      state.errorMessage = null;
    },
  },
});

export const { setQuestionDraftId, setExamDraftId, setDraftStatus, setDraftSaved, markUnsaved, resetDraft } = draftSlice.actions;
export default draftSlice.reducer;
