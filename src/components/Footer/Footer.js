import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <div className={styles["footer"]}>
      <div className={styles["sub-footer"]}>
        <p className={styles["webname"]}>BlogTalk</p>
        <p className={styles["copyright"]}>
          Copyright &copy; 2024 Sunny Kumar
        </p>
      </div>
    </div>
  );
};

export default Footer;
