'use client';

import PredictionForm from './PredictionForm';
import DailyFortune from './DailyFortune';
import Footer from './Footer';
import styles from './HomeClient.module.css';
import 'antd-mobile/es/global';

export default function HomeClient() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
          <PredictionForm />
        
          <DailyFortune />
      </div>
      
      <Footer />
    </div>
  );
} 