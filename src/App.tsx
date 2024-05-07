// import ExpUseTransition from "./ExpReact19/ExpUseTransition.tsx";
// import ExpUseActionState from "./ExpReact19/ExpUseActionState.tsx";
import ExpUseOptimistic from "./ExpReact19/ExpUseOptimistic.tsx";
import {useState} from "react";
export default ()=>{
    const [currentName, setCurrentName] = useState("fancy")

    return (<>
        {/*<ExpUseTransition/>*/}
        {/*    <ExpUseActionState></ExpUseActionState>*/}
            <ExpUseOptimistic currentName={currentName} onUpdateName={(name)=>setCurrentName(name)}></ExpUseOptimistic>
    </>
    )
}