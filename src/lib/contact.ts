// Contact form subjects; values match the backend's contact_subject enum
export const CONTACT_SUBJECTS = [
  { value: "purchase", label: "مشاوره خرید خودرو" },
  { value: "installment", label: "شرایط و محاسبه اقساط" },
  { value: "support", label: "پیگیری درخواست یا قرارداد" },
  { value: "other", label: "سایر موارد" },
] as const

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number]["value"]

export const contactSubjectLabel = (value: ContactSubject) =>
  CONTACT_SUBJECTS.find((s) => s.value === value)?.label ?? value
