import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { appService } from "@/services/appServise"
import type { IConfig, TDeviceType } from "@/types/app"

export const sendMessageThunk = createAsyncThunk(
  "app/sendMessage",
  async (data: { phone: string | number; message: string }) => {
    const res = await appService.sendMessage(data)
    return res.data
  },
)

const getDeviceType = (): TDeviceType => {
  if (typeof window === "undefined") {
    return "desktop";
  }

  const width = window.innerWidth;

  if (width <= 768) {
    return "mobile";
  } else if (width <= 1366) {
    return "tablet";
  } else {
    return "desktop";
  }
};

interface AppState {
  config: IConfig | null;
  loading: boolean;
  deviceType: TDeviceType;
}

const initialState: AppState = {
  config: null,
  deviceType: getDeviceType(),
  loading: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setDeviceType: (state, action: PayloadAction<TDeviceType>) => {
      state.deviceType = action.payload;
    },
    updateDeviceType: (state) => {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        if (width <= 768) {
          state.deviceType = "mobile";
        } else if (width <= 1366) {
          state.deviceType = "tablet";
        } else {
          state.deviceType = "desktop";
        }
      }
    },
  },
  selectors: {
    selectConfig: (state) => state.config,
    selectDeviceType: (state) => state.deviceType,
    selectLoading: (state) => state.loading,
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessageThunk.pending, (state) => {
         state.loading = true
      }) 
      .addCase(sendMessageThunk.fulfilled, (state) => {
         state.loading = false
      })
      .addCase(sendMessageThunk.rejected, (state) => {
         state.loading = false
      }) 
  },
});

export const {selectConfig, selectDeviceType, selectLoading} = appSlice.selectors;
export const {updateDeviceType, setDeviceType } = appSlice.actions;
export default appSlice.reducer;
