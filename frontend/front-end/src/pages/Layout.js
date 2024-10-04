import { Outlet, Link } from "react-router-dom";
import React, {useState} from 'react';
import image from '../Images/Kenyan flag.PNG'



function Layout(){

    
        const [isOpen, setIsOpen] = useState(false);
      
        const toggleMenu = () => {
          setIsOpen(!isOpen);
        };

        const images = [
            {id:1, image:image},
        ]
    


    return(
        <div>
         {/* Header Section */}
         <header className="bg-black text-white py-4">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                {/* Logo and Title */}
                <div className="flex items-center">
                <img
                    src={images[0].image}
                    alt="Kenya Flag"
                    className="w-8 h-8 mr-3"
                />
                <h1 className="text-2xl font-bold">Shirikisha</h1>
                </div>

                {/* Navigation */}
                <nav className="mt-4 md:mt-0">
                <ul className="flex space-x-4">
                    <li><a href="/" className="hover:text-green-400">Home</a></li>
                    {/* <li><a href="#" className="hover:text-green-400">About</a></li> */}
                    <li><a href="/Bills" className="hover:text-green-400">Bills</a></li>
                    <li><a href="/Results" className="hover:text-green-400">Results</a></li>
                </ul>
                </nav>

                {/* Call-to-action Button */}
                <a
                href="/Bills"
                className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 md:mt-0 hover:bg-green-600"
                >
                View Bills
                </a>
            </div>
            </header>

            

            {/* Footer Section */}
      

        <Outlet />
        <footer className="bg-black text-white py-8">
                <div className="container mx-auto text-center">
                <p>&copy; 2024 Shirikisha. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
export default Layout