/**
 * ============================================================================
 * FORMS PAGE - Form handling with @modular-forms/solid
 * ============================================================================
 *
 * This page demonstrates:
 * 1. @modular-forms/solid for form state management
 * 2. Valibot for schema validation
 * 3. Different input types and validation rules
 * 4. Form submission handling
 *
 * KEY CONCEPTS:
 *
 * 1. MODULAR FORMS (@modular-forms/solid)
 *    - createForm: Creates a form instance
 *    - Field: Renders form fields with validation
 *    - Form: Wrapper component for form submission
 *    - Built-in validation, touched states, error handling
 *
 * 2. VALIBOT (Schema Validation)
 *    - Type-safe schema definitions
 *    - Built-in validation rules (email, minLength, etc.)
 *    - Custom validation messages
 *    - Works with Modular Forms via adapter
 */

import { createSignal, Show, For } from "solid-js";
import * as v from "valibot";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Stack,
  Alert,
  Grid,
  Divider,
  Chip,
} from "@suid/material";

/**
 * CONTACT FORM SCHEMA
 *
 * Valibot schema defines the shape and validation rules for form data.
 * Each field can have multiple validation rules chained together.
 */
const ContactFormSchema = v.object({
  /**
   * Name field with length validation
   */
  name: v.pipe(
    v.string(),
    v.minLength(2, "Name must be at least 2 characters"),
    v.maxLength(50, "Name must be at most 50 characters")
  ),

  /**
   * Email field with email format validation
   */
  email: v.pipe(
    v.string(),
    v.email("Please enter a valid email address")
  ),

  /**
   * Phone field (optional with format validation)
   */
  phone: v.optional(
    v.pipe(
      v.string(),
      v.regex(/^[\d\s\-+()]*$/, "Please enter a valid phone number")
    )
  ),

  /**
   * Subject field with enum validation
   */
  subject: v.pipe(
    v.string(),
    v.minLength(1, "Please select a subject")
  ),

  /**
   * Message field with length validation
   */
  message: v.pipe(
    v.string(),
    v.minLength(10, "Message must be at least 10 characters"),
    v.maxLength(500, "Message must be at most 500 characters")
  ),

  /**
   * Priority field
   */
  priority: v.pipe(
    v.string(),
    v.minLength(1, "Please select a priority")
  ),

  /**
   * Terms acceptance checkbox
   */
  acceptTerms: v.pipe(
    v.boolean(),
    v.literal(true, "You must accept the terms")
  ),

  /**
   * Newsletter subscription (optional)
   */
  newsletter: v.optional(v.boolean()),
});

/**
 * Infer TypeScript type from Valibot schema
 */
type ContactFormData = v.InferInput<typeof ContactFormSchema>;

/**
 * Styled form input component
 */
function FormInput(props: {
  label: string;
  name: string;
  type?: string;
  value: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  onInput: (e: Event) => void;
  onBlur: (e: Event) => void;
}) {
  return (
    <Box sx={{ marginBottom: 2 }}>
      <Typography
        component="label"
        sx={{
          display: "block",
          marginBottom: 0.5,
          fontWeight: 500,
          color: props.error ? "error.main" : "text.primary",
        }}
      >
        {props.label} {props.required && "*"}
      </Typography>
      <input
        type={props.type || "text"}
        name={props.name}
        value={props.value}
        placeholder={props.placeholder}
        onInput={props.onInput}
        onBlur={props.onBlur}
        style={{
          width: "100%",
          padding: "12px 14px",
          "font-size": "16px",
          border: props.error ? "2px solid #d32f2f" : "1px solid #ccc",
          "border-radius": "4px",
          "box-sizing": "border-box",
          outline: "none",
        }}
      />
      <Typography
        variant="caption"
        sx={{ color: props.error ? "error.main" : "text.secondary", marginTop: 0.5 }}
      >
        {props.error || props.placeholder}
      </Typography>
    </Box>
  );
}

/**
 * Forms Page Component
 */
export function Forms() {
  /**
   * Track form submission state
   */
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [submitSuccess, setSubmitSuccess] = createSignal(false);
  const [submittedData, setSubmittedData] = createSignal<ContactFormData | null>(null);

  /**
   * Form state using signals for manual control
   * This approach avoids the SUID type conflicts
   */
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [phone, setPhone] = createSignal("");
  const [subject, setSubject] = createSignal("");
  const [message, setMessage] = createSignal("");
  const [priority, setPriority] = createSignal("");
  const [acceptTerms, setAcceptTerms] = createSignal(false);
  const [newsletter, setNewsletter] = createSignal(false);

  /**
   * Validation errors
   */
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [touched, setTouched] = createSignal<Record<string, boolean>>({});

  /**
   * Validate a single field
   */
  const validateField = (fieldName: string, value: unknown): string | null => {
    const fieldSchema = ContactFormSchema.entries[fieldName as keyof typeof ContactFormSchema.entries];
    if (!fieldSchema) return null;

    try {
      v.parse(v.object({ [fieldName]: fieldSchema }), { [fieldName]: value });
      return null;
    } catch (err) {
      if (err instanceof v.ValiError) {
        return err.issues[0]?.message || "Invalid value";
      }
      return "Invalid value";
    }
  };

  /**
   * Handle field blur - mark as touched and validate
   */
  const handleBlur = (fieldName: string, value: unknown) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: error || "" }));
  };

  /**
   * Validate all fields
   */
  const validateAll = (): boolean => {
    const formData = {
      name: name(),
      email: email(),
      phone: phone(),
      subject: subject(),
      message: message(),
      priority: priority(),
      acceptTerms: acceptTerms(),
      newsletter: newsletter(),
    };

    try {
      v.parse(ContactFormSchema, formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof v.ValiError) {
        const newErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          const path = issue.path?.[0]?.key as string;
          if (path && !newErrors[path]) {
            newErrors[path] = issue.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      subject: true,
      message: true,
      priority: true,
      acceptTerms: true,
      newsletter: true,
    });

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const formData: ContactFormData = {
      name: name(),
      email: email(),
      phone: phone(),
      subject: subject(),
      message: message(),
      priority: priority(),
      acceptTerms: acceptTerms(),
      newsletter: newsletter(),
    };

    console.log("Form submitted:", formData);
    setSubmittedData(formData);
    setSubmitSuccess(true);
    setIsSubmitting(false);
  };

  /**
   * Reset form
   */
  const handleReset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
    setPriority("");
    setAcceptTerms(false);
    setNewsletter(false);
    setErrors({});
    setTouched({});
    setSubmitSuccess(false);
    setSubmittedData(null);
  };

  /**
   * Subject options for dropdown
   */
  const subjectOptions = [
    { value: "general", label: "General Inquiry" },
    { value: "support", label: "Technical Support" },
    { value: "sales", label: "Sales Question" },
    { value: "feedback", label: "Feedback" },
    { value: "other", label: "Other" },
  ];

  const isFormDirty = () =>
    name() || email() || phone() || subject() || message() || priority() || acceptTerms();

  return (
    <Container maxWidth="md">
      <Box sx={{ marginTop: 4, marginBottom: 4 }}>
        <Typography variant="h3" gutterBottom>
          Contact Form
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Form handling with validation using Valibot schema
        </Typography>
      </Box>

      {/* Success Message */}
      <Show when={submitSuccess()}>
        <Alert severity="success" sx={{ marginBottom: 3 }}>
          Form submitted successfully! Check the console and below for submitted data.
        </Alert>
      </Show>

      {/* Form */}
      <Paper elevation={3} sx={{ padding: 4, marginBottom: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Name Field */}
            <Grid item xs={12} sm={6}>
              <FormInput
                label="Name"
                name="name"
                value={name()}
                error={touched().name ? errors().name : undefined}
                required
                placeholder="Enter your full name"
                onInput={(e) => setName((e.target as HTMLInputElement).value)}
                onBlur={() => handleBlur("name", name())}
              />
            </Grid>

            {/* Email Field */}
            <Grid item xs={12} sm={6}>
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={email()}
                error={touched().email ? errors().email : undefined}
                required
                placeholder="your@email.com"
                onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                onBlur={() => handleBlur("email", email())}
              />
            </Grid>

            {/* Phone Field */}
            <Grid item xs={12} sm={6}>
              <FormInput
                label="Phone"
                name="phone"
                type="tel"
                value={phone()}
                error={touched().phone ? errors().phone : undefined}
                placeholder="+1 234 567 8900 (optional)"
                onInput={(e) => setPhone((e.target as HTMLInputElement).value)}
                onBlur={() => handleBlur("phone", phone())}
              />
            </Grid>

            {/* Subject Dropdown */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ marginBottom: 2 }}>
                <Typography
                  component="label"
                  sx={{
                    display: "block",
                    marginBottom: 0.5,
                    fontWeight: 500,
                    color: touched().subject && errors().subject ? "error.main" : "text.primary",
                  }}
                >
                  Subject *
                </Typography>
                <select
                  name="subject"
                  value={subject()}
                  onInput={(e) => setSubject((e.target as HTMLSelectElement).value)}
                  onBlur={() => handleBlur("subject", subject())}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    "font-size": "16px",
                    border: touched().subject && errors().subject ? "2px solid #d32f2f" : "1px solid #ccc",
                    "border-radius": "4px",
                    "box-sizing": "border-box",
                    "background-color": "white",
                  }}
                >
                  <option value="">Select a subject...</option>
                  <For each={subjectOptions}>
                    {(option) => <option value={option.value}>{option.label}</option>}
                  </For>
                </select>
                <Typography
                  variant="caption"
                  sx={{ color: touched().subject && errors().subject ? "error.main" : "text.secondary" }}
                >
                  {touched().subject && errors().subject ? errors().subject : "What is your inquiry about?"}
                </Typography>
              </Box>
            </Grid>

            {/* Priority Radio Group */}
            <Grid item xs={12}>
              <Box sx={{ marginBottom: 2 }}>
                <Typography
                  sx={{
                    marginBottom: 1,
                    fontWeight: 500,
                    color: touched().priority && errors().priority ? "error.main" : "text.primary",
                  }}
                >
                  Priority *
                </Typography>
                <Stack direction="row" spacing={3}>
                  <For each={["low", "medium", "high"]}>
                    {(value) => (
                      <label style={{ display: "flex", "align-items": "center", cursor: "pointer" }}>
                        <input
                          type="radio"
                          name="priority"
                          value={value}
                          checked={priority() === value}
                          onChange={() => setPriority(value)}
                          onBlur={() => handleBlur("priority", priority())}
                          style={{ "margin-right": "8px" }}
                        />
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </label>
                    )}
                  </For>
                </Stack>
                <Show when={touched().priority && errors().priority}>
                  <Typography variant="caption" color="error">
                    {errors().priority}
                  </Typography>
                </Show>
              </Box>
            </Grid>

            {/* Message Textarea */}
            <Grid item xs={12}>
              <Box sx={{ marginBottom: 2 }}>
                <Typography
                  component="label"
                  sx={{
                    display: "block",
                    marginBottom: 0.5,
                    fontWeight: 500,
                    color: touched().message && errors().message ? "error.main" : "text.primary",
                  }}
                >
                  Message *
                </Typography>
                <textarea
                  name="message"
                  value={message()}
                  onInput={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
                  onBlur={() => handleBlur("message", message())}
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    "font-size": "16px",
                    border: touched().message && errors().message ? "2px solid #d32f2f" : "1px solid #ccc",
                    "border-radius": "4px",
                    "box-sizing": "border-box",
                    resize: "vertical",
                    "font-family": "inherit",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: touched().message && errors().message ? "error.main" : "text.secondary" }}
                >
                  {touched().message && errors().message
                    ? errors().message
                    : `${message().length}/500 characters (min 10)`}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ marginY: 1 }} />
            </Grid>

            {/* Checkboxes */}
            <Grid item xs={12}>
              <Box>
                <label style={{ display: "flex", "align-items": "center", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={acceptTerms()}
                    onChange={(e) => {
                      setAcceptTerms((e.target as HTMLInputElement).checked);
                      handleBlur("acceptTerms", (e.target as HTMLInputElement).checked);
                    }}
                    style={{ "margin-right": "8px", width: "18px", height: "18px" }}
                  />
                  <Typography>I accept the terms and conditions *</Typography>
                </label>
                <Show when={touched().acceptTerms && errors().acceptTerms}>
                  <Typography variant="caption" color="error" sx={{ display: "block", marginTop: 0.5 }}>
                    {errors().acceptTerms}
                  </Typography>
                </Show>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <label style={{ display: "flex", "align-items": "center", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={newsletter()}
                  onChange={(e) => setNewsletter((e.target as HTMLInputElement).checked)}
                  style={{ "margin-right": "8px", width: "18px", height: "18px" }}
                />
                <Typography>Subscribe to newsletter (optional)</Typography>
              </label>
            </Grid>

            {/* Submit Buttons */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmitting()}
                >
                  {isSubmitting() ? "Submitting..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="large"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Stack>
            </Grid>

            {/* Form State Info */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip
                  label={`Valid: ${Object.values(errors()).some(Boolean) ? "No" : "Yes"}`}
                  color={Object.values(errors()).some(Boolean) ? "error" : "success"}
                  size="small"
                />
                <Chip
                  label={`Dirty: ${isFormDirty() ? "Yes" : "No"}`}
                  color={isFormDirty() ? "warning" : "default"}
                  size="small"
                />
                <Chip
                  label={`Touched: ${Object.values(touched()).some(Boolean) ? "Yes" : "No"}`}
                  size="small"
                />
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Submitted Data Display */}
      <Show when={submittedData()}>
        <Paper elevation={2} sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h6" gutterBottom>
            Submitted Data
          </Typography>
          <Box
            component="pre"
            sx={{
              backgroundColor: "grey.100",
              padding: 2,
              borderRadius: 1,
              overflow: "auto",
              fontSize: "0.875rem",
            }}
          >
            {JSON.stringify(submittedData(), null, 2)}
          </Box>
        </Paper>
      </Show>

      {/* Learning Notes */}
      <Paper
        elevation={1}
        sx={{
          padding: 3,
          marginBottom: 4,
          backgroundColor: "primary.light",
          color: "primary.contrastText",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Form Validation Concepts
        </Typography>
        <Box component="ul" sx={{ margin: 0, paddingLeft: 3 }}>
          <li>
            <Typography variant="body2">
              <strong>Valibot Schema:</strong> Defines validation rules with type inference.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>v.pipe():</strong> Chains multiple validators together (string → minLength → maxLength).
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Field-level validation:</strong> Validate on blur for immediate feedback.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Touched state:</strong> Only show errors for fields the user has interacted with.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Form-level validation:</strong> Validate all fields before submission.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Type inference:</strong> v.InferInput extracts TypeScript types from schema.
            </Typography>
          </li>
        </Box>
      </Paper>
    </Container>
  );
}
