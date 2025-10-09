"use client";

import Canvas from "@/components/dashboard/Canvas"
import Sidebar from "@/components/dashboard/Sidebar"
// import ProtectedRoute from "@/components/ProtectedRoute"

export default function Dashboard(){
    return (
        // <ProtectedRoute>
            <div className="flex h-screen bg-gray-100">
                {/* Left Sidebar */}
                <Sidebar />
                
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    {/* Canvas Area */}
                    <div className="flex-1 overflow-hidden">
                        <Canvas />
                    </div>
                </div>
            </div>
        // </ProtectedRoute>
    )
}