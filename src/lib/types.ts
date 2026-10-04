export type Role = "member" | "admin";
export type TiffinType = "full" | "half";

export type AppUser = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  is_active: boolean;
};

export type Mess = {
  id: string;
  name: string;
  full_price: number;
  half_price: number;
  is_active: boolean;
};

export type Order = {
  id: string;
  order_date: string;
  mess_id: string;
  tiffin_type: TiffinType;
  unit_price: number;
  created_by: string;
  notes: string | null;
  created_at: string;
};

export type OrderShare = {
  id: string;
  order_id: string;
  user_id: string;
  share_amount: number;
};

/** An order joined with its mess name and its shares, as returned by the app's queries. */
export type OrderWithDetails = Order & {
  messes: { name: string } | null;
  order_shares: { user_id: string; share_amount: number }[];
};
