import React from "react";

import Icon from '../../../../assets/img/icon-header-bandera.png'

export default function IconHeader() {
    return (
        <div className="flex-shrink-0">
            <a href="#" className="text-xl font-bold text-blue-600 tracking-wide">
              <img src={Icon} alt="" className="max-w-[60px]" />
            </a>
        </div>
    )
}