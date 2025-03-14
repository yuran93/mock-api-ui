"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface RequestDataType {
  body: {
    amount: number
    betId: string
    transactionId: string
    bonusFlag: boolean
    userId: string
  }
  responseStatus: number
  path: string
  ttl: string
}

const requestTypes = [
  {
    id: "reserve",
    label: "Reserve",
  },
  {
    id: "confirm",
    label: "Confirm",
  },
  {
    id: "refundBet",
    label: "Refund Bet",
  },
  {
    id: "settleBet",
    label: "Settle Bet",
  },
  {
    id: "credit",
    label: "Credit",
  },
  {
    id: "debit",
    label: "Debit",
  },
] as const

const FormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
})

const baseUrl = "https://external.curiosity.ext.thebetmakers.com/mock-api/v1/wallet"

export default function Home() {
  const [requests, setRequests] = useState<RequestDataType[]>([])

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: [],
    },
  })

  const getRequests = async (uri: string): Promise<RequestDataType[]> => {
    const resp = await fetch(`${baseUrl}/${uri}`)

    return await resp.json() as RequestDataType[]
  }

  const onSubmit = async (d: z.infer<typeof FormSchema>) => {
    setRequests([])

    const requests: RequestDataType[][] = await Promise.all(
      d.items.map(async (i) => {
        return getRequests(i);
      })
    );

    setRequests(requests.flat())
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} 
          className="mb-6 p-3 rounded-md border border-gray-200 flex items-center gap-6">
          <FormField
            control={form.control}
            name="items"
            render={() => (
              <>
                <FormItem className="flex">
                  {requestTypes.map((requestType) => (
                    <FormField
                      key={requestType.id}
                      control={form.control}
                      name="items"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={requestType.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(requestType.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, requestType.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== requestType.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {requestType.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </FormItem>
                <FormMessage />
              </>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>UserID</TableHead>
            <TableHead>BetID</TableHead>
            <TableHead>TransactionID</TableHead>
            <TableHead>BonusFlag</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map(request => (
            <TableRow key={request.ttl}>
              <TableCell>{request.path.split("/").pop()}</TableCell>
              <TableCell>{request.body.userId}</TableCell>
              <TableCell>{request.body.betId}</TableCell>
              <TableCell>{request.body.transactionId}</TableCell>
              <TableCell>{request.body.bonusFlag ? 'Yes' : 'No'}</TableCell>
              <TableCell className="text-right">{(request.body.amount/100).toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
