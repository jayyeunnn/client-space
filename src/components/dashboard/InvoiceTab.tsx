"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, FileText, Download } from "lucide-react";
import type { Invoice, InvoiceItem } from "@/types";

interface Props {
  projectId: string;
  initialInvoice: Invoice | null;
}

function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

const EMPTY_ITEM: InvoiceItem = { description: "", qty: 1, rate: 0, amount: 0 };

export function InvoiceTab({ projectId, initialInvoice }: Props) {
  const [invoice, setInvoice] = useState<Invoice | null>(initialInvoice);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [items, setItems] = useState<InvoiceItem[]>(
    initialInvoice?.items ?? [{ ...EMPTY_ITEM }]
  );
  const [taxRate, setTaxRate] = useState<number>(initialInvoice?.tax_rate ?? 0);
  const [dueDate, setDueDate] = useState<string>(initialInvoice?.due_date ?? "");
  const [notes, setNotes] = useState<string>(initialInvoice?.notes ?? "");

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.rate, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  function updateItem(index: number, field: keyof InvoiceItem, value: string | number) {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[index] };
      if (field === "description") item.description = value as string;
      if (field === "qty") item.qty = Number(value) || 0;
      if (field === "rate") item.rate = Number(value) || 0;
      item.amount = item.qty * item.rate;
      next[index] = item;
      return next;
    });
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function startEdit() {
    setItems(invoice?.items ?? [{ ...EMPTY_ITEM }]);
    setTaxRate(invoice?.tax_rate ?? 0);
    setDueDate(invoice?.due_date ?? "");
    setNotes(invoice?.notes ?? "");
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  async function handleSave() {
    if (items.some((i) => !i.description.trim())) {
      setError("Semua item harus memiliki deskripsi.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      project_id: projectId,
      items: items.map((i) => ({ ...i, amount: i.qty * i.rate })),
      subtotal,
      tax_rate: taxRate,
      total,
      due_date: dueDate || null,
      notes: notes.trim() || null,
    };

    try {
      const method = invoice ? "PATCH" : "POST";
      const url = invoice ? `/api/invoice/${invoice.id}` : "/api/invoice";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal menyimpan invoice"); return; }
      setInvoice(data);
      setEditing(false);
      toast.success(invoice ? "Invoice diperbarui" : "Invoice dibuat");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  function handleDownloadPDF() {
    if (!invoice) return;
    window.open(`/api/invoice/${invoice.id}/pdf`, "_blank");
  }

  const inputStyle: React.CSSProperties = {
    padding: "7px 10px",
    border: "1px solid var(--cs-bdh)",
    borderRadius: 5,
    fontSize: 13,
    color: "var(--cs-ink)",
    background: "var(--cs-surface)",
    outline: "none",
    fontFamily: "var(--font-ui)",
    width: "100%",
    transition: "border-color 0.12s, box-shadow 0.12s",
  };

  function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = "var(--cs-ac)";
    e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.12)";
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.borderColor = "var(--cs-bdh)";
    e.target.style.boxShadow = "none";
  }

  return (
    <div className="max-w-[760px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2
          className="font-semibold"
          style={{ fontSize: 14, color: "var(--cs-ink)", letterSpacing: "-0.01em" }}
        >
          Invoice
          {invoice && (
            <span style={{ color: "var(--cs-ink3)", fontWeight: 400, marginLeft: 6 }}>
              #{invoice.invoice_number}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {invoice && !editing && (
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 cursor-pointer"
              style={{
                padding: "7px 12px",
                background: "transparent",
                border: "1px solid var(--cs-bdh)",
                borderRadius: 6,
                fontSize: 12,
                color: "var(--cs-ink2)",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cs-s2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Download size={13} strokeWidth={1.5} />
              Unduh PDF
            </button>
          )}
          {!editing && (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 font-medium cursor-pointer"
              style={{
                padding: "7px 12px",
                background: "var(--cs-ink)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 12,
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#292524")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--cs-ink)")}
            >
              {invoice ? "Edit Invoice" : "Buat Invoice"}
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      {editing ? (
        <InvoiceEditor
          items={items}
          taxRate={taxRate}
          dueDate={dueDate}
          notes={notes}
          subtotal={subtotal}
          taxAmount={taxAmount}
          total={total}
          saving={saving}
          error={error}
          inputStyle={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
          onItemChange={updateItem}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onTaxRateChange={setTaxRate}
          onDueDateChange={setDueDate}
          onNotesChange={setNotes}
          onSave={handleSave}
          onCancel={cancelEdit}
        />
      ) : invoice ? (
        <InvoiceView invoice={invoice} />
      ) : (
        <EmptyInvoice onCreate={startEdit} />
      )}
    </div>
  );
}

function InvoiceEditor({
  items, taxRate, dueDate, notes,
  subtotal, taxAmount, total,
  saving, error, inputStyle, onFocus, onBlur,
  onItemChange, onAddItem, onRemoveItem,
  onTaxRateChange, onDueDateChange, onNotesChange,
  onSave, onCancel,
}: {
  items: InvoiceItem[];
  taxRate: number;
  dueDate: string;
  notes: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  saving: boolean;
  error: string | null;
  inputStyle: React.CSSProperties;
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onItemChange: (i: number, f: keyof InvoiceItem, v: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (i: number) => void;
  onTaxRateChange: (v: number) => void;
  onDueDateChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        background: "var(--cs-surface)",
        border: "1px solid var(--cs-bd)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Items table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--cs-bd)" }}>
              {["Deskripsi", "Qty", "Harga", "Total", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--cs-ink3)",
                    textAlign: h === "Qty" || h === "Harga" || h === "Total" ? "right" : "left",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    width: h === "" ? 36 : h === "Qty" ? 70 : h === "Harga" ? 130 : h === "Total" ? 130 : "auto",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--cs-bd)" }}>
                <td style={{ padding: "8px 14px" }}>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => onItemChange(i, "description", e.target.value)}
                    placeholder="Nama layanan / produk"
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </td>
                <td style={{ padding: "8px 14px" }}>
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) => onItemChange(i, "qty", e.target.value)}
                    style={{ ...inputStyle, textAlign: "right", width: 56 }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </td>
                <td style={{ padding: "8px 14px" }}>
                  <input
                    type="number"
                    min={0}
                    value={item.rate}
                    onChange={(e) => onItemChange(i, "rate", e.target.value)}
                    placeholder="0"
                    style={{ ...inputStyle, textAlign: "right", width: 110 }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </td>
                <td
                  style={{
                    padding: "8px 14px",
                    fontSize: 13,
                    color: "var(--cs-ink)",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatRupiah(item.qty * item.rate)}
                </td>
                <td style={{ padding: "8px 10px 8px 4px" }}>
                  {items.length > 1 && (
                    <button
                      onClick={() => onRemoveItem(i)}
                      className="cursor-pointer flex items-center justify-center"
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--cs-mu)",
                        width: 32,
                        height: 32,
                        borderRadius: 4,
                        transition: "color 0.12s, background 0.12s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--cs-error)";
                        e.currentTarget.style.background = "rgba(220,38,38,0.06)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--cs-mu)";
                        e.currentTarget.style.background = "none";
                      }}
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add item */}
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--cs-bd)" }}>
        <button
          onClick={onAddItem}
          className="flex items-center gap-1.5 cursor-pointer"
          style={{
            background: "none",
            border: "none",
            fontSize: 12,
            color: "var(--cs-ac)",
            fontWeight: 500,
            padding: 0,
          }}
        >
          <Plus size={13} strokeWidth={2} />
          Tambah item
        </button>
      </div>

      {/* Totals + meta */}
      <div className="flex flex-col md:flex-row gap-5 p-5">
        {/* Meta kiri */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--cs-ink2)" }}>
              Tanggal jatuh tempo <span style={{ fontSize: 11, color: "var(--cs-mu)", fontWeight: 400 }}>(opsional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
              style={{ ...inputStyle, width: "auto", maxWidth: 180 }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--cs-ink2)" }}>
              Catatan <span style={{ fontSize: 11, color: "var(--cs-mu)", fontWeight: 400 }}>(opsional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Catatan untuk klien..."
              rows={3}
              style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>

        {/* Totals kanan */}
        <div style={{ minWidth: 220 }}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 13, color: "var(--cs-ink3)" }}>Subtotal</span>
              <span style={{ fontSize: 13, color: "var(--cs-ink)" }}>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span style={{ fontSize: 13, color: "var(--cs-ink3)" }}>PPN</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={taxRate}
                  onChange={(e) => onTaxRateChange(Number(e.target.value))}
                  style={{ ...inputStyle, width: 52, textAlign: "right", padding: "4px 8px" }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <span style={{ fontSize: 13, color: "var(--cs-ink3)" }}>%</span>
                <span style={{ fontSize: 13, color: "var(--cs-ink)", marginLeft: 4 }}>
                  {formatRupiah(taxAmount)}
                </span>
              </div>
            </div>
            <div
              className="flex items-center justify-between pt-2"
              style={{ borderTop: "1px solid var(--cs-bd)" }}
            >
              <span className="font-semibold" style={{ fontSize: 14, color: "var(--cs-ink)" }}>
                Total
              </span>
              <span className="font-semibold" style={{ fontSize: 14, color: "var(--cs-ink)" }}>
                {formatRupiah(total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error + actions */}
      <div
        className="flex items-center justify-between gap-3 px-5 pb-5"
        style={{ paddingTop: 0 }}
      >
        {error ? (
          <p style={{ fontSize: 12, color: "var(--cs-error)" }}>{error}</p>
        ) : <div />}
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            style={{
              padding: "8px 14px",
              background: "transparent",
              color: "var(--cs-ink3)",
              border: "1px solid var(--cs-bdh)",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Batal
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-1.5 font-medium cursor-pointer"
            style={{
              padding: "8px 16px",
              background: saving ? "var(--cs-bdh)" : "var(--cs-ink)",
              color: saving ? "var(--cs-mu)" : "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving && <Loader2 size={13} strokeWidth={2} className="animate-spin" />}
            {saving ? "Menyimpan..." : "Simpan Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InvoiceView({ invoice: inv }: { invoice: Invoice }) {
  return (
    <div
      style={{
        background: "var(--cs-surface)",
        border: "1px solid var(--cs-bd)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--cs-bd)" }}>
              {["Deskripsi", "Qty", "Harga", "Total"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 16px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--cs-ink3)",
                    textAlign: h !== "Deskripsi" ? "right" : "left",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--cs-bd)" }}>
                <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--cs-ink)" }}>
                  {item.description}
                </td>
                <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--cs-ink3)", textAlign: "right" }}>
                  {item.qty}
                </td>
                <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--cs-ink3)", textAlign: "right", whiteSpace: "nowrap" }}>
                  {formatRupiah(item.rate)}
                </td>
                <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--cs-ink)", fontWeight: 500, textAlign: "right", whiteSpace: "nowrap" }}>
                  {formatRupiah(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex flex-col md:flex-row gap-5 p-5">
        <div className="flex-1">
          {inv.due_date && (
            <p style={{ fontSize: 13, color: "var(--cs-ink3)" }}>
              Jatuh tempo:{" "}
              <span style={{ color: "var(--cs-ink)", fontWeight: 500 }}>
                {new Date(inv.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </p>
          )}
          {inv.notes && (
            <p
              style={{
                fontSize: 12,
                color: "var(--cs-ink3)",
                marginTop: 8,
                lineHeight: 1.7,
                maxWidth: 320,
              }}
            >
              {inv.notes}
            </p>
          )}
        </div>
        <div style={{ minWidth: 200 }} className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span style={{ fontSize: 13, color: "var(--cs-ink3)" }}>Subtotal</span>
            <span style={{ fontSize: 13, color: "var(--cs-ink)" }}>{formatRupiah(inv.subtotal)}</span>
          </div>
          {inv.tax_rate > 0 && (
            <div className="flex justify-between">
              <span style={{ fontSize: 13, color: "var(--cs-ink3)" }}>PPN ({inv.tax_rate}%)</span>
              <span style={{ fontSize: 13, color: "var(--cs-ink)" }}>
                {formatRupiah(inv.total - inv.subtotal)}
              </span>
            </div>
          )}
          <div
            className="flex justify-between pt-2"
            style={{ borderTop: "1px solid var(--cs-bd)" }}
          >
            <span className="font-semibold" style={{ fontSize: 14, color: "var(--cs-ink)" }}>Total</span>
            <span className="font-semibold" style={{ fontSize: 14, color: "var(--cs-ink)" }}>
              {formatRupiah(inv.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyInvoice({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        style={{
          width: 44,
          height: 44,
          background: "var(--cs-s2)",
          borderRadius: 99,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <FileText size={20} strokeWidth={1.5} style={{ color: "var(--cs-mu)" }} />
      </div>
      <p className="font-semibold mb-1" style={{ fontSize: 14, color: "var(--cs-ink)" }}>
        Belum ada invoice
      </p>
      <p style={{ fontSize: 12, color: "var(--cs-ink3)", marginBottom: 14, lineHeight: 1.6 }}>
        Buat invoice untuk dikirim ke klien via portal.
      </p>
      <button
        onClick={onCreate}
        className="flex items-center gap-1.5 font-medium cursor-pointer"
        style={{
          padding: "7px 14px",
          background: "var(--cs-ink)",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontSize: 12,
          transition: "background 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#292524")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--cs-ink)")}
      >
        <Plus size={13} strokeWidth={2} />
        Buat Invoice
      </button>
    </div>
  );
}
