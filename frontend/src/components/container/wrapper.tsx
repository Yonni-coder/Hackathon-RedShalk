import Footer from "../navigation/footer"
import Navbar from "../navigation/navbar"

export default function Wrapper ({ children }: { children: React.ReactNode }) {
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