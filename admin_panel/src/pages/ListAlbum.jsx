import React, { use } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";

const ListAlbum = () => {
    const [data, setData] = React.useState([]);

    const fetchAlbums = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/album/list`);
            if (response.data.success) {
                setData(response.data.albums);
            }
        } catch (error) {
            toast.error("Something went wrong");
        }

    }
    const removeAlbum = async (id) => {
        try {
            const response = await axios.post(`http://localhost:4000/api/album/remove`, { id });
            if (response.data.success) {
                toast.success(response.data.message);
                await fetchAlbums();
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    }

    useEffect(() => {
        fetchAlbums();

    }, []);
    return (
        <div>
            <p>All Album</p>
            <br />
            <div className="sm:grid hidden grid-cols-[0.5fr_1fr_2fr_1fr_0.5fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5 bg-gray-100">
                <b>Image</b>
                <b>Name</b>
                <b>Description</b>
                <b>Bg Color</b>
                <b>Action</b>
            </div>
            {data.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_1fr] sm:grid-cols-[0.5fr_1fr_2fr_1fr_0.5fr] items-center gap-2.5 p-3 border border-gray-300 text-sm mr-5">
                    <img className="w-12" src={item.image} alt="" />
                    <p>{item.name}</p>
                    <p>{item.desc}</p>
                    <input type="color" value={item.bgColor} />
                    <p onClick={() => removeAlbum(item._id)} className="cursor-pointer">Xóa</p>
                </div>
            ))}
        </div>
    )
}
export default ListAlbum