"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import styles from "../page.module.css";

export default function InboxActions() {
  return (
    <div className={styles.inboxActions}>
      <Link href="/" className={styles.inboxLink}>← Back to Home</Link>
      <button
        onClick={() => signOut()}
        className={styles.inboxLink}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
      >
        Logout
      </button>
    </div>
  );
} 