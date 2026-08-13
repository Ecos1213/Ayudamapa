import {useMemo, useState} from "react";
import { Wrench, Stethoscope, Flashlight } from "lucide-react";


import FilterBar from "./MainBodyComponent/FilterBar";
import StatsBar from "./MainBodyComponent/StatsBar";
import SitesList from "./MainBodyComponent/SitesList";

export default function MainBody({SITES}) {
    const [filter, setFilter] = useState("todos");


    const filteredSites = useMemo(() => {
        if (filter === "todos") return SITES;
        if (filter === "critico") return SITES.filter((s) => s.urgent);
        return SITES.filter((s) => s.type === filter);
    }, [filter]);

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
            <FilterBar filter={filter} setFilter={setFilter}/>
            <StatsBar stats={{ atrapadas: 14, sitios: 27, refugios: 9, voluntarios: 63 }} />
            <SitesList sites={filteredSites} />
        </div>
    )
}