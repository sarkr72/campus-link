'use client'
import React from 'react'
import RateMyProfessor from '@/app/components/RateMyProfessor'
import { useParams, useSearchParams, usePathname } from "next/navigation";
import qs from 'query-string';

const Rate = () => {
    const { id } = useParams();
    const formattedId = id.replace('%20', ' ');
  return (
    <div>
        {console.log("here", formattedId)}
      <RateMyProfessor professor={formattedId}/>
    </div>
  )
}

export default Rate
