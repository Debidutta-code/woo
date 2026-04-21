"use client";

import { useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import toast from "react-hot-toast";

function FailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const socketRef = useRef<any>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!ref || initialized.current) return;
    initialized.current = true;

    // Cleanup localStorage
    localStorage.removeItem("fikafiOrderRef");
    localStorage.removeItem("pendingBookingData");
    localStorage.removeItem("ngeniusOrderRef");

    // Try to connect socket - but don't rely on it
    const connectSocket = async () => {
      try {
        const { default: io } = await import("socket.io-client");
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
        
        if (!socketUrl) {
          console.log("⚠️ NEXT_PUBLIC_SOCKET_URL not configured");
          return;
        }

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
            router.replace("/payment-success");
          }
        });

        socketRef.current.on("connect_error", () => {
          console.log("⚠️ Socket connection failed - continuing without socket");
        });

        socketRef.current.on("disconnect", () => {
          console.log("Socket disconnected");
        });
      } catch (error) {
        console.log("⚠️ Socket initialization failed:", error);
      }
    };

    // Try connecting but don't block - use passive initialization
    setTimeout(connectSocket, 100);

    // Redirect to payment page after timeout (socket or no socket)
    const timeout = setTimeout(() => {
      router.replace("/payment");
    }, 8000);

    return () => {
      clearTimeout(timeout);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [ref, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8">
        <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-4">
          Your payment was not completed or expired. Please try again.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to payment page...
        </p>
      </div>
    </div>
  );
}

export default function FailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <FailedContent />
    </Suspense>
  );
}