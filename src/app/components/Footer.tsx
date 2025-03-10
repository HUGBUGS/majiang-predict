import styles from './HomeClient.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.copyright}>
        © {currentYear} 麻将方位预测 版权所有
      </div>
      <div className={styles.disclaimer}>
        本应用仅供娱乐，预测结果不作为任何决策依据
      </div>
    </footer>
  );
} 