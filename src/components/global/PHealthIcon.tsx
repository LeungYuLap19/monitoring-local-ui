import React from 'react'
import icon from "../../assets/icons/PHealth.png"

export default function PHealthIcon({ size = 'base' }: { size?: 'base' | 'small' }) {
  return (
    <div className="flex flex-col">
        <div className="flex space-x-1 items-center -mb-1">
            <img 
                src={icon} 
                alt="Phealth Icon" 
                className="h-4 opacity-0"
            />
            <p className={`text-[#CBCBCA] ${size == 'small' ? 'text-[8px]' : 'text-xs'}`}>
                Powered By
            </p>
        </div>  
        
        <div className="flex space-x-1 items-center">
            <img 
                src={icon} 
                alt="Phealth Icon" 
                className={`${size == 'small' ? 'h-3' : 'h-4'}`}
            />
            <p className={`text-[#FF8D1A] ${size == 'small' ? 'text-md' : 'text-xl' }`}>PHealth OS</p>
        </div>  
    </div>
  )
}
