import { useState } from 'react';
import IMessage from '../interface/IMessage'
import { useForm } from 'react-hook-form';

const Room = () => {
    const initialState: IMessage = {
        username: "",
        receiver: "",
        connect: false,
        message: ""
    }

    const [isConnected, setIsConnected] = useState(false);

    const { register, handleSubmit } = useForm<IMessage>({
        defaultValues: initialState,
    });

    const onSubmit = (data: any) => { console.log(data); setIsConnected(true) }

    return (
        <>
            {isConnected ?
                <> connected</>
                : <form onSubmit={handleSubmit(onSubmit)}>
                    <input {...register("username")} required />
                    <input type="submit" />
                </form>}

        </>
    )
}

export default Room