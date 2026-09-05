import React from "react"; 
const SOURCES = [ "Shazoo", "StopGame", "DTF", "Meduza", "Wowhead", "Standard", "УНИАН" ]; 
export default function SourceBar({ value = [], onChange, showSources }) 
{ 
  if (!showSources) return null; 
  function toggle(src) 
  { 
    const newValue = value.includes(src) ? value.filter(s => s !== src) : [...value, src]; 
    onChange?.(newValue); 
  } 

  return ( 
  <div className="source-bar"> 
  {
  SOURCES.map(src => ( <label key={src} className="checkbox-label"> 
  <input type="checkbox" 
  checked={value.includes(src)} 
  onChange={() => toggle(src)} /> 
  <span className="checkmark">
    </span> {src} </label> ))} 
    </div> ); 
    }