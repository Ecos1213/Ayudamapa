import React from "react";
import { Wrench, Stethoscope, Flashlight, Droplet, Bed, Baby } from "lucide-react";

import Header from "../components/layout/Header";
import MainBody from "../components/layout/MainBody";


class Index extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            points: [],
            sites: [],
            selectedPoint: null,
            loading: true
        };
    }

    componentDidMount() {
        this.loadPoints();
        const sites = [
            {
                id: 1,
                type: "escombros",
                urgent: true,
                name: "Edificio Torres del Rio",
                city: "Cali, Valle del Cauca",
                address: "Cra 15 #8-42, barrio San Fernando",
                lat: 3.4372,
                lng: -76.5225,
                status: "4 personas atrapadas reportadas",
                description: "Colapso parcial del tercer piso...",
                updatedMinutesAgo: 8,
                needs: [
                    { label: "Maquinaria pesada", icon: Wrench },
                    { label: "Personal médico", icon: Stethoscope },
                    { label: "Generadores", icon: Flashlight },
                ],
            },
            {
                id: 2,
                type: "refugio",
                urgent: false,
                name: "Coliseo El Pueblo",
                city: "Cali, Valle del Cauca",
                address: "Av. Pasoancho #38-33",
                lat: 3.3902,
                lng: -76.5309,
                status: "210 personas alojadas · capacidad 300",
                updatedMinutesAgo: 60,
                needs: [
                    { label: "Agua potable", icon: Droplet },
                    { label: "Cobijas", icon: Bed },
                    { label: "Insumos bebé", icon: Baby },
                ],
            },
            {
                id: 3,
                type: "refugio",
                urgent: true,
                name: "Coliseo El Pueblo",
                city: "Cali, Valle del Cauca",
                address: "Av. Pasoancho #38-33",
                lat: 3.3902,
                lng: -76.5309,
                status: "210 personas alojadas · capacidad 300",
                updatedMinutesAgo: 60,
                needs: [
                    { label: "Agua potable", icon: Droplet },
                    { label: "Cobijas", icon: Bed },
                    { label: "Insumos bebé", icon: Baby },
                ],
            },
            {
                id: 4,
                type: "escombros",
                urgent: true,
                name: "Coliseo El Pueblo",
                city: "Cali, Valle del Cauca",
                address: "Av. Pasoancho #38-33",
                lat: 3.3902,
                lng: -76.5309,
                status: "210 personas alojadas · capacidad 300",
                updatedMinutesAgo: 60,
                needs: [
                    { label: "Agua potable", icon: Droplet },
                    { label: "Cobijas", icon: Bed },
                    { label: "Insumos bebé", icon: Baby },
                ],
            },
            {
                id: 5,
                type: "refugio",
                urgent: false,
                name: "Coliseo El Pueblo",
                city: "Cali, Valle del Cauca",
                address: "Av. Pasoancho #38-33",
                lat: 3.3902,
                lng: -76.5309,
                status: "210 personas alojadas · capacidad 300",
                updatedMinutesAgo: 60,
                needs: [
                    { label: "Agua potable", icon: Droplet },
                    { label: "Cobijas", icon: Bed },
                    { label: "Insumos bebé", icon: Baby },
                ],
            },
            
        ];

        this.setState({ sites, loading: false });
    }

    componentDidUpdate(prevProps, prevState) {
        // Solo cuando sea necesario
    }

    componentWillUnmount() {
        // Limpieza si tenemos suscripciones/timers
    }

    async loadPoints() {
        // API
    }

    render() {
        if (this.state.loading) {
            return (
                <p className="text-center text-sm text-neutral-500 py-10">
                Cargando sitios...
                </p>
            );
        }

        return (
            <main>
                <Header />
                <MainBody SITES={this.state.sites}/>
            </main>
        );
    }
}

export default Index;