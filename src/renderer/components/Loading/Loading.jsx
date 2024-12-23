
import styles from "./Loading.module.scss";

const Loading = ()=>{


    return(
        <div className={styles.lds_ellipsis}><div></div><div></div><div></div><div></div></div>
    );
}

export default Loading;