import React from "react";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import axios from "axios";

const AddAlbum = () => {
    const [image, setImage] = React.useState(false);
    const [color, setColor] = React.useState("#121212");
    const [Name, setName] = React.useState("");
    const [Description, setDescription] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("image", image);
            formData.append("name", Name);
            formData.append("desc", Description);
            formData.append("bgColor", color);

            const response = await axios.post(`http://localhost:4000/api/album/add`, formData);
            if (response.data.success) {
                toast.success("Album added successfully");
                setImage(false);
                setName("");
                setDescription("");

            }
            else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
        setLoading(false);
    }
    return loading ? (
        <div className="grid place-items-center w-[90vw] sm:w-[500px] h-[70vh]">
            <div className="w-16 h-16 place-self-center border-4 border-gray-400 border-t-green-800 rounded-full animate-spin">

            </div>
        </div>
    ) : (
        <form onSubmit={onSubmitHandler} className="flex flex-col items-start gap-8 text-gray-600">
            <div className="flex flex-col gap-4">
                <p>Upload Image</p>
                <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" accept="image/*" hidden />
                <label htmlFor="image">
                    <img className="w-24 cursor-pointer" src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
                </label>
            </div>
            <div className="flex flex-col gap-2.5">
                <p>Album Name</p>
                <input onChange={(e) => setName(e.target.value)} value={Name} className="bg-transparent outline-black border-2 border-gray-400 p-2.5 w-[max(40vw, 250px)]" type="text" placeholder="Type here" />
            </div>
            <div className="flex flex-col gap-2.5">
                <p>Album Description</p>
                <input onChange={(e) => setDescription(e.target.value)} value={Description} className="bg-transparent outline-black border-2 border-gray-400 p-2.5 w-[max(40vw, 250px)]" type="text" placeholder="Type here" />
            </div>
            <div className="flex flex-col gap-3">
                <p>Background Color</p>
                <input onChange={(e) => setColor(e.target.value)} value={color} type="color" />
            </div>
            <button className="text-base bg-blue-400 text-black py-2.5 px-14 cursor-pointer">ADD</button>

        </form>
    )
}
export default AddAlbum