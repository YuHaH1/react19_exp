import {useState, useTransition} from "react";

function updateName(name:string):Promise<string>{
    return new Promise((r)=>{
        setTimeout(()=>{
            if (!name)r("name不能为空")
        },2000)
    })
}

export default ()=>{
    const [name, setName] = useState("");
    const [error, setError] = useState<string|null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = () => {
        startTransition(async () => {
            const error = await updateName(name);
            if (error) {
                setError(error);
                return;
            }
        })
    };
    const renderLoading = ()=>{
        return <div className="loader"></div>
    }
    return (
        <div>
            <input value={name} onChange={(event) => setName(event.target.value)}/>
            {isPending && renderLoading()}
            <button onClick={handleSubmit} disabled={isPending}>
                Update
            </button>
            {error && <p style={{color:"red"}}>{error}</p>}
        </div>
    )
}
