import { useEffect } from "react";
import Footer from "../navigation/footer"
import Navbar from "../navigation/navbar"
import useRoomsStore from "@/stores/roomsStore";

export default function Wrapper ({ children }: { children: React.ReactNode }) {
    const loadingRooms = useRoomsStore((s) => s.loading);
          const error = useRoomsStore((s) => s.error);
          const loadRooms = useRoomsStore((s) => s.loadRooms);
        
          useEffect(() => {
            loadRooms();
          }, [loadRooms]);

          if (loadingRooms) return "Chargement..."
    return (
        <>
            <div className="z-10 border-box relative flex-col">
                <Navbar />
                <div className="px-5 md:px-[10%]">
                    {children}
                </div>
                <Footer />
            </div>
        </>
    )
}