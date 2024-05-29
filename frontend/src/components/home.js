import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Home = () => {

    const navigate = useNavigate();

    // Auto relocate to login page on load.
    useEffect(() => {
        navigate( "/login");
    }, [])

    return ( <div></div> )

}