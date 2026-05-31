import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  adminSidebarCollapsed: boolean;
  theme: "light" | "dark" | "system";
  activeModal: string | null;
}

const initialState: UIState = {
  adminSidebarCollapsed: false,
  theme: "light",
  activeModal: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleAdminSidebar(state) {
      state.adminSidebarCollapsed = !state.adminSidebarCollapsed;
    },
    setAdminSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.adminSidebarCollapsed = action.payload;
    },
    setTheme(state, action: PayloadAction<"light" | "dark" | "system">) {
      state.theme = action.payload;
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
  },
});

export const { toggleAdminSidebar, setAdminSidebarCollapsed, setTheme, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
