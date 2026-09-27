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

let incomingWebhookReady: Promise<boolean> | null = null

export const enableIncomingWebhookThunk = createAsyncThunk(
  "app/enableIncomingWebhook",
  async () => {
    incomingWebhookReady ??= appService
      .getSettings()
      .then(async (res) => {
        if (res.data?.incomingWebhook === "yes") return false
        await appService.setSettings({ incomingWebhook: "yes" })
        return true
      })
      .catch((error: unknown) => {
        incomingWebhookReady = null
        throw error
      })

    return incomingWebhookReady
  },
)

export const messageAnswerThunk = createAsyncThunk("app/messageAnswerThunk", async () => {
  const res = await appService.receiveNotification()
  const notification = res.data
  if (!notification?.receiptId) return null

  await appService.deleteNotification(notification.receiptId)
  return notification
})

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

export const {selectConfig, selectDeviceType} = appSlice.selectors;
export const {updateDeviceType, setDeviceType } = appSlice.actions;
export default appSlice.reducer;
