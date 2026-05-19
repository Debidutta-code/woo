"use client";

import { useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const socketRef = useRef<any>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!ref || initialized.current) return;
    initialized.current = true;

    const connectSocket = async () => {
      try {
        const { default: io } = await import("socket.io-client");
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
        
        if (!socketUrl) return;

        socketRef.current = io(socketUrl, {
          transports: ["websocket", "polling"],
          reconnection: false,
          timeout: 3000,
        });

        socketRef.current.on("connect", () => {
          const roomName = `payment:${ref}`;
          socketRef.current.emit("join-payment-room", roomName);
        });

        socketRef.current.on("payment-status-update", (data: any) => {
          if (data.orderReference === ref && data.status === "success") {
            toast.success("Payment successful!");
            Cookies.remove("fikafiOrderRef", { path: "/" });
            Cookies.remove("pendingBookingData", { path: "/" });
            setTimeout(() => {
              router.replace("/payment-success");
            }, 1500);
          }
        });

        socketRef.current.on("connect_error", () => {
          console.log("⚠️ Socket connection failed");
        });
      } catch (error) {
        console.log("⚠️ Socket initialization failed");
      }
    };

    setTimeout(connectSocket, 100);

    const fallbackTimeout = setTimeout(() => {
      router.replace("/payment-success");
    }, 15000);

    return () => {
      clearTimeout(fallbackTimeout);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [ref, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600">Redirecting to booking confirmation...</p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
