/*
  # Add service usage and token deduction function

  1. New Functions
    - `log_service_usage_and_deduct_tokens`: Handles service usage logging and token deduction in a single transaction
      - Parameters:
        - p_user_id (uuid): User ID
        - p_service_name (text): Name of the service
        - p_input_image_url (text): URL of input image
        - p_prompt (text): User prompt
        - p_tokens_deducted (integer): Number of tokens to deduct
        - p_replicate_id (text): Replicate prediction ID
      - Returns: service_usage record
  
  2. Security
    - Function is marked as SECURITY DEFINER to run with elevated privileges
    - Access is restricted to authenticated users
*/

-- Create the function to handle service usage logging and token deduction
CREATE OR REPLACE FUNCTION public.log_service_usage_and_deduct_tokens(
  p_user_id uuid,
  p_service_name text,
  p_input_image_url text,
  p_prompt text,
  p_tokens_deducted integer,
  p_replicate_id text
)
RETURNS SETOF service_usage
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_service_usage_record service_usage;
  v_current_credits integer;
BEGIN
  -- Check if user has enough credits
  SELECT credits INTO v_current_credits
  FROM user_profiles
  WHERE user_id = p_user_id
  FOR UPDATE;  -- Lock the row for update

  IF v_current_credits IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  IF v_current_credits < p_tokens_deducted THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Deduct tokens from user's credits
  UPDATE user_profiles
  SET 
    credits = credits - p_tokens_deducted,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Insert service usage record
  INSERT INTO service_usage (
    user_id,
    service_name,
    input_image_url,
    prompt,
    tokens_deducted,
    replicate_id
  )
  VALUES (
    p_user_id,
    p_service_name,
    p_input_image_url,
    p_prompt,
    p_tokens_deducted,
    p_replicate_id
  )
  RETURNING * INTO v_service_usage_record;

  RETURN NEXT v_service_usage_record;
END;
$$;