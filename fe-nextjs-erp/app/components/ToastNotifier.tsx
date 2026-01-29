import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { ToastMessage, Toast as ToastType } from 'primereact/toast';
// import { ToastMessage } from "primereact/api";

export interface ToastNotifierHandle {
    showToast: (status: string, message?: string) => void;
}

const ToastNotifier = forwardRef<ToastNotifierHandle>((_, ref) => {
    const toast = useRef<ToastType>(null);

    useImperativeHandle(ref, () => ({
        showToast(status: string, message = '') {
            let config: ToastMessage = {};

            switch (status) {
                case '00':
                    config = {
                        severity: 'success',
                        summary: 'Success',
                        detail: message || 'Operation was successful!'
                    };
                    break;
                case '01':
                    config = {
                        severity: 'error',
                        summary: 'Failed',
                        detail: message || 'Operation failed!'
                    };
                    break;
                case '03':
                    config = {
                        severity: 'warn',
                        summary: 'Not Found',
                        detail: message || 'Resource not found!'
                    };
                    break;
                case '99':
                    config = {
                        severity: 'error',
                        summary: 'Bad Request',
                        detail: message || 'Invalid request!'
                    };
                    break;
                default:
                    config = {
                        severity: 'info',
                        summary: 'Info',
                        detail: message || 'Unknown status!'
                    };
                    break;
            }

            toast.current?.show(config);
        }
    }));

    return <Toast ref={toast} />;
});

ToastNotifier.displayName = 'ToastNotifier';

export default ToastNotifier;
