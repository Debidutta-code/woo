import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { IPropertyCommission, CommissionType, IUPropertyCommission } from "./interfaces";
import type { CurrencyCode } from "@/components/currency-code/currency-code.type";
import { getPropertyCommission, createPropertyCommission, updatePropertyCommission } from "./services/property-commission.service";
import { currencies } from "@/components/currency-code/cuurency";
import BackButton from "@/components/shared/BackButton";
import Loader from "@/components/Loader/Loader";
import toast from "react-hot-toast";

const PropertyCommissionPage: React.FC = () => {
    const { t } = useTranslation();
    const { propertyId } = useParams<{ propertyId: string }>();
    const [loading, setLoading] = useState(false);
    const [commission, setCommission] = useState<IPropertyCommission | null>(null);
    const [commissionType, setCommissionType] = useState<CommissionType>("percentage");
    const [commissionValue, setCommissionValue] = useState<string>("0");
    const [commissionCurrency, setCommissionCurrency] = useState<CurrencyCode>("INR");
    const [isActive, setIsActive] = useState<boolean>(true);

    useEffect(() => {
        if (propertyId) {
            fetchCommission();
        }
    }, [propertyId]);

    const fetchCommission = async () => {
        setLoading(true);
        try {
            const response = await getPropertyCommission(propertyId!);
            if (response.success && response.data) {
                setCommission(response.data);
                setCommissionType(response.data.commissionType);
                setCommissionValue(response.data.commissionValue.toString());
                setCommissionCurrency(response.data.currencyCode || "INR");
            } else {
                setCommission(null);
            }
        } catch (error) {
            toast.error(t("PropertyCommission.failedToFetchCommission"));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!propertyId) return;

        const data: IUPropertyCommission = {
            commissionType,
            commissionValue: parseFloat(commissionValue) || 0,
            currencyCode: commissionType === "fixed" ? commissionCurrency : undefined,
        };

        try {
            const response = commission
                ? await updatePropertyCommission(propertyId, data)
                : await createPropertyCommission({ ...data, propertyId } as any);

            if (response.success) {
                toast.success(response.message || t("PropertyCommission.commissionSavedSuccessfully"));
                fetchCommission();
            } else {
                toast.error(response.message || t("PropertyCommission.failedToSaveCommission"));
            }
        } catch (error) {
            toast.error(t("PropertyCommission.failedToSaveCommission"));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full flex justify-center items-center">
                <Loader text={t("PropertyCommission.loading")} />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                    <BackButton />
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {t("PropertyCommission.title")}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {t("PropertyCommission.description")}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {commission ? t("PropertyCommission.editCommission") : t("PropertyCommission.createCommission")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="commissionType">{t("PropertyCommission.commissionType")} *</Label>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant={commissionType === "percentage" ? "default" : "outline"}
                                        onClick={() => setCommissionType("percentage")}
                                        className="flex-1"
                                    >
                                        {t("PropertyCommission.percentage")}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={commissionType === "fixed" ? "default" : "outline"}
                                        onClick={() => setCommissionType("fixed")}
                                        className="flex-1"
                                    >
                                        {t("PropertyCommission.fixedAmount")}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="commissionValue">
                                    {commissionType === "percentage"
                                        ? `${t("PropertyCommission.commissionValue")} (%)`
                                        : t("PropertyCommission.commissionValue")}
                                </Label>
                                <Input
                                    id="commissionValue"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={commissionType === "percentage" ? "100" : undefined}
                                    value={commissionValue}
                                    onChange={(e) => setCommissionValue(e.target.value)}
                                    required
                                />
                            </div>

                            {commissionType === "fixed" && (
                                <div className="space-y-2">
                                    <Label htmlFor="currencyCode">{t("PropertyCommission.currencyCode")} *</Label>
                                    <Select
                                        value={commissionCurrency}
                                        onValueChange={(v) => setCommissionCurrency(v as CurrencyCode)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.map((currency) => (
                                                <SelectItem key={currency.code} value={currency.code}>
                                                    {currency.name} ({currency.symbol})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="isActive">{t("PropertyCommission.activeStatus")}</Label>
                                    <p className="text-sm text-gray-500">{t("PropertyCommission.activeStatusDescription")}</p>
                                </div>
                                <Switch
                                    id="isActive"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" className="flex-1">
                                    {commission ? t("PropertyCommission.updateCommission") : t("PropertyCommission.createCommission")}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PropertyCommissionPage;