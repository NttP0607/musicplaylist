import React, { use } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";

const AddSong = () => {
    const [image, setImage] = React.useState(false);
    const [song, setSong] = React.useState(false);
    const [Name, setName] = React.useState("");
    const [Description, setDescription] = React.useState("");
    const [Album, setAlbum] = React.useState("none");
    const [loading, setLoading] = React.useState(false);
    const [albums, setAlbums] = React.useState([]);

    const onSumitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("image", image);
            formData.append("audio", song);
            formData.append("name", Name);
            formData.append("desc", Description);
            formData.append("album", Album);

            const response = await axios.post(`http://localhost:4000/api/song/add`, formData);
            if (response.data.success) {
                toast.success("Song added successfully");
                setImage(false);
                setSong(false);
                setName("");
                setDescription("");
                setAlbum("none");
            }
            else {
                toast.error(response.data.message);
            }
        }
        catch (error) {
            toast.error("Something went wrong");
        }
        setLoading(false);
    }
    const loadAlbums = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/album/list`);
            if (response.data.success) {
                setAlbums(response.data.albums);
            }
            else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    }
    useEffect(() => {
        loadAlbums();
    }, []);
    return loading ? (
        <div className="grid place-items-center w-[90vw] sm:w-[500px] h-[70vh]">
            <div className="w-16 h-16 place-self-center border-4 border-gray-400 border-t-green-800 rounded-full animate-spin">

            </div>
        </div>
    ) : (
        <form onSubmit={onSumitHandler} className="flex flex-col gap-5 w-[90vw] sm:w-[500px]">
            <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-4">
                    <p>Upload song</p>
                    <input onChange={(e) => setSong(e.target.files[0])} type="file" id='song' accept="audio/*" hidden />
                    <label htmlFor="song">
                        <img src={song ? assets.upload_added : assets.upload_song} className="w-24 cursor-pointer" alt="" />
                    </label>

                </div>
                <div className="flex flex-col gap-4">
                    <p>Upload Imgae</p>
                    <input onChange={(e) => setImage(e.target.files[0])} type="file" id='image' accept="image/*" hidden />
                    <label htmlFor="image">
                        <img src={image ? URL.createObjectURL(image) : assets.upload_area} className="w-24 cursor-pointer" alt="" />
                    </label>

                </div>

            </div>
            <div className="flex flex-col gap-2.5">
                <p>Song Name</p>
                <input onChange={(e) => setName(e.target.value)} value={Name} className="bg-transparent outline-black border-2 border-gray-400 p-2.5 w-[max(40vw, 250px)]" placeholder="Type here" type="text" required />
            </div>
            <div className="flex flex-col gap-2.5">
                <p>Song Description</p>
                <input onChange={(e) => setDescription(e.target.value)} value={Description} className="bg-transparent outline-black border-2 border-gray-400 p-2.5 w-[max(40vw, 250px)]" placeholder="Type here" type="text" required />
            </div>
            <div className="flex flex-col gap-2.5">
                <p>Album</p>
                <select onChange={(e) => setAlbum(e.target.value)} defaultValue={Album} className="bg-transparent outline-black border-2 border-gray-400 p-2.5 w-[150px]">
                    <option value="none">None</option>
                    {albums.map((item, index) => (
                        <option key={index} value={item.name}>{item.name}</option>
                    ))}
                </select>

            </div>
            <button type="submit" className="bg-[#4CAF50] text-white font-bold py-2 px-4 rounded w-[max(40vw, 250px)] hover:bg-[#45a049]">ADD</button>

        </form>
    )
}
export default AddSong